"""
predictor.py — Tích hợp UserBehaviorModel (Transformer) vào API.
Feature Importance: Attention Weights trung bình (avg over layers & heads).
"""

import os, io, logging, pickle
import torch
import torch.nn as nn
import torch.nn.functional as F

logger    = logging.getLogger(__name__)
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "model_weights")

_CANDIDATE_NAMES = ["trans_model_final.pt", "model.pt", "trans_model.pt"]

_FALLBACK_CFG = {
    "max_seq_len" : 37,
    "embed_dim"   : 512,
    "hidden_dim"  : 512,
    "n_layers"    : 8,
    "n_heads"     : 8,
    "dropout"     : 0.1,
    "head_hidden" : 192,
}


# ═══════════════════════════════════════════════════════════════════════════════
#  MODEL CLASSES
# ═══════════════════════════════════════════════════════════════════════════════

class Vocabulary:
    PAD_IDX = 0
    UNK_IDX = 1
    def __init__(self):
        self.token2idx = {}
        self.next_idx  = 2
    def encode(self, val) -> int:
        return self.token2idx.get(val, self.UNK_IDX)
    @property
    def size(self) -> int:
        return self.next_idx


class ClassificationHead(nn.Module):
    def __init__(self, in_dim, hidden_dim, n_classes, dropout):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_dim, hidden_dim),
            nn.LayerNorm(hidden_dim),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, n_classes),
        )
    def forward(self, x):
        return self.net(x)


class TransformerEncoder(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim,
                 n_layers, n_heads, max_seq_len, dropout):
        super().__init__()
        self.max_seq_len   = max_seq_len
        self.embedding     = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.pos_embedding = nn.Embedding(max_seq_len + 1, embed_dim)
        self.seg_embedding = nn.Embedding(5, embed_dim)
        self.dropout       = nn.Dropout(dropout)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=embed_dim, nhead=n_heads,
            dim_feedforward=embed_dim * 4, dropout=dropout,
            batch_first=True, activation=F.gelu, norm_first=True,
        )
        self.encoder   = nn.TransformerEncoder(encoder_layer, num_layers=n_layers)
        self.cls_token = nn.Parameter(torch.randn(1, 1, embed_dim))
        self.out_dim   = embed_dim

    def _segment_ids(self, mask):
        cumsum = mask.cumsum(dim=1).float()
        total  = mask.sum(dim=1, keepdim=True).float()
        ratio  = cumsum / (total + 1e-9)
        seg    = torch.full(mask.shape, 4, dtype=torch.long, device=mask.device)
        seg[mask & (ratio <= 0.33)]                   = 1
        seg[mask & (ratio > 0.33) & (ratio <= 0.67)] = 2
        seg[mask & (ratio > 0.67)]                    = 3
        return seg

    def forward(self, seq, mask):
        B, T = seq.shape
        x    = self.embedding(seq)
        cls  = self.cls_token.expand(B, -1, -1)
        x    = torch.cat([cls, x], dim=1)
        pos     = torch.arange(T + 1, device=seq.device).unsqueeze(0).expand(B, -1)
        pos_emb = self.pos_embedding(pos)
        cls_seg = torch.zeros(B, 1, dtype=torch.long, device=seq.device)
        tok_seg = self._segment_ids(mask)
        seg_emb = self.seg_embedding(torch.cat([cls_seg, tok_seg], dim=1))
        x       = self.dropout(x + pos_emb + seg_emb)
        cls_keep             = torch.zeros(B, 1, dtype=torch.bool, device=mask.device)
        src_key_padding_mask = torch.cat([cls_keep, ~mask], dim=1)
        out = self.encoder(x, src_key_padding_mask=src_key_padding_mask)
        return out[:, 0, :]


class UserBehaviorModel(nn.Module):
    def __init__(self, vocab_size, n_classes_list, cfg):
        super().__init__()
        self.encoder = TransformerEncoder(
            vocab_size  = vocab_size,
            embed_dim   = cfg["embed_dim"],
            hidden_dim  = cfg["hidden_dim"],
            n_layers    = cfg["n_layers"],
            n_heads     = cfg["n_heads"],
            max_seq_len = cfg["max_seq_len"],
            dropout     = cfg["dropout"],
        )
        combined_dim = cfg["embed_dim"] + 2
        self.neck = nn.Sequential(
            nn.Linear(combined_dim, cfg["embed_dim"]),
            nn.LayerNorm(cfg["embed_dim"]),
            nn.GELU(),
            nn.Dropout(cfg["dropout"]),
        )
        self.heads = nn.ModuleList([
            ClassificationHead(cfg["embed_dim"], cfg["head_hidden"], n_cls, cfg["dropout"])
            for n_cls in n_classes_list
        ])

    def forward(self, seq, mask, meta):
        context        = self.encoder(seq, mask)
        combined       = torch.cat([context, meta], dim=-1)
        fused_features = self.neck(combined)
        return [head(fused_features) for head in self.heads]


# ═══════════════════════════════════════════════════════════════════════════════
#  PREPROCESSING
# ═══════════════════════════════════════════════════════════════════════════════

def _preprocess(tokens: list[int], vocab: Vocabulary, max_seq_len: int, device):
    encoded = [vocab.encode(t) for t in tokens]
    if len(encoded) > max_seq_len:
        encoded = encoded[-max_seq_len:]
    seq_len = len(encoded)
    pad_len = max_seq_len - seq_len
    seq  = [Vocabulary.PAD_IDX] * pad_len + encoded
    mask = [False] * pad_len + [True] * seq_len
    seq_len_norm = seq_len / max_seq_len
    unique_ratio = len(set(encoded)) / max(seq_len, 1)
    seq_t  = torch.tensor([seq],  dtype=torch.long).to(device)
    mask_t = torch.tensor([mask], dtype=torch.bool).to(device)
    meta_t = torch.tensor([[seq_len_norm, unique_ratio]], dtype=torch.float).to(device)
    return seq_t, mask_t, meta_t


# ═══════════════════════════════════════════════════════════════════════════════
#  FEATURE IMPORTANCE — Attention Weights trung bình
#
#  Ý tưởng:
#    - CLS token (vị trí 0) là đại diện toàn chuỗi để phân loại.
#    - Mỗi layer, mỗi head đều có attention map shape [T+1, T+1].
#    - Lấy hàng CLS (index 0) → attention của CLS đến từng token.
#    - Average qua tất cả layers và heads.
#    - Token nào được CLS "nhìn" nhiều nhất → quan trọng nhất.
# ═══════════════════════════════════════════════════════════════════════════════

def _compute_importance(model, seq_t, mask_t, meta_t) -> list[float]:
    """
    Trả về list[float] độ dài = số token thực (không kể PAD).
    Giá trị trong [0, 1], normalize min-max.
    """
    model.eval()
    B, T = seq_t.shape

    # ── Đăng ký hook để lấy attention weights từ mỗi layer ──────────────────
    # PyTorch TransformerEncoderLayer không expose attn weights mặc định,
    # nên cần forward thủ công với need_weights=True.
    collected_attn = []   # list of [B, n_heads, T+1, T+1]

    cls_keep             = torch.zeros(B, 1, dtype=torch.bool, device=mask_t.device)
    src_key_padding_mask = torch.cat([cls_keep, ~mask_t], dim=1)  # [B, T+1]

    # Build input giống hệt TransformerEncoder.forward()
    x       = model.encoder.embedding(seq_t)
    cls     = model.encoder.cls_token.expand(B, -1, -1)
    x       = torch.cat([cls, x], dim=1)                              # [B, T+1, E]
    pos     = torch.arange(T + 1, device=seq_t.device).unsqueeze(0).expand(B, -1)
    pos_emb = model.encoder.pos_embedding(pos)
    cls_seg = torch.zeros(B, 1, dtype=torch.long, device=seq_t.device)
    tok_seg = model.encoder._segment_ids(mask_t)
    seg_emb = model.encoder.seg_embedding(torch.cat([cls_seg, tok_seg], dim=1))
    x       = model.encoder.dropout(x + pos_emb + seg_emb)           # [B, T+1, E]

    # ── Chạy qua từng TransformerEncoderLayer thủ công ──────────────────────
    with torch.no_grad():
        for layer in model.encoder.encoder.layers:
            # norm_first=True: LayerNorm trước self-attn
            x_norm = layer.norm1(x)

            # Gọi self_attn với need_weights=True để lấy attention map
            attn_out, attn_weights = layer.self_attn(
                x_norm, x_norm, x_norm,
                key_padding_mask = src_key_padding_mask,
                need_weights     = True,
                average_attn_weights = False,   # giữ nguyên từng head
            )
            # attn_weights: [B, n_heads, T+1, T+1]
            collected_attn.append(attn_weights.cpu())

            # Tiếp tục forward đúng chuẩn norm_first
            x = x + layer.dropout1(attn_out)
            x = x + layer.dropout2(layer.linear2(layer.dropout(layer.activation(layer.linear1(layer.norm2(x))))))

    # ── Tổng hợp attention: avg over layers và heads ─────────────────────────
    # Stack: [n_layers, B, n_heads, T+1, T+1]
    all_attn = torch.stack(collected_attn, dim=0)

    # Average over layers và heads → [B, T+1, T+1]
    avg_attn = all_attn.mean(dim=(0, 2))   # [B, T+1, T+1]

    # Lấy hàng CLS (index 0) → attention từ CLS đến từng token
    # Shape: [B, T+1] → bỏ vị trí 0 (CLS→CLS) lấy từ index 1 trở đi
    cls_attn = avg_attn[0, 0, 1:]         # [T] — attention của CLS đến T tokens

    # Chỉ lấy phần token thực (bỏ PAD bên trái)
    pad_len    = int((~mask_t[0]).sum().item())
    real_attn  = cls_attn[pad_len:].tolist()   # độ dài = số token thực

    # Normalize về [0, 1]
    mn, mx = min(real_attn), max(real_attn)
    rng    = mx - mn if mx > mn else 1e-9
    return [round((s - mn) / rng, 4) for s in real_attn]


# ═══════════════════════════════════════════════════════════════════════════════
#  CUSTOM UNPICKLER
# ═══════════════════════════════════════════════════════════════════════════════

class _VocabUnpickler(pickle.Unpickler):
    _CLASS_MAP = {("__main__", "Vocabulary"): Vocabulary}
    def find_class(self, module, name):
        return self._CLASS_MAP.get((module, name)) or super().find_class(module, name)


class _PickleMod:
    __name__         = "pickle"
    Unpickler        = _VocabUnpickler
    dump             = staticmethod(pickle.dump)
    dumps            = staticmethod(pickle.dumps)
    load             = staticmethod(pickle.load)
    loads            = staticmethod(pickle.loads)
    HIGHEST_PROTOCOL = pickle.HIGHEST_PROTOCOL
    DEFAULT_PROTOCOL = pickle.DEFAULT_PROTOCOL


def _torch_load(path: str, device):
    with open(path, "rb") as f:
        return torch.load(
            io.BytesIO(f.read()),
            map_location=device,
            weights_only=False,
            pickle_module=_PickleMod,
        )


# ═══════════════════════════════════════════════════════════════════════════════
#  MAIN PREDICTOR
# ═══════════════════════════════════════════════════════════════════════════════

class ModelPredictor:
    def __init__(self):
        self.model      = None
        self.vocab      = None
        self.cfg        = None
        self.n_classes  = None
        self.class_maps = None
        self.device     = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.is_loaded  = False

    def _find_model_path(self) -> str | None:
        for name in _CANDIDATE_NAMES:
            path = os.path.join(MODEL_DIR, name)
            if os.path.exists(path):
                return path
        return None

    def load(self):
        path = self._find_model_path()
        if path is None:
            logger.warning(
                f"Không tìm thấy model trong {MODEL_DIR}. "
                f"Thử tên: {_CANDIDATE_NAMES}. API chạy ở chế độ STUB."
            )
            return
        try:
            logger.info(f"Đang load model từ: {path}")
            ckpt = _torch_load(path, self.device)

            self.cfg   = {**_FALLBACK_CFG, **ckpt.get("cfg", {})}
            self.vocab = ckpt["vocab"]

            if "n_classes_list" in ckpt:
                n_classes_list = ckpt["n_classes_list"]
            else:
                state          = ckpt["model_state"]
                n_classes_list = []
                for i in range(6):
                    key = f"heads.{i}.net.4.weight"
                    if key not in state:
                        raise KeyError(f"Thiếu '{key}'. Chạy kaggle_save_checkpoint.py.")
                    n_classes_list.append(state[key].shape[0])
                logger.warning(f"n_classes_list suy ra: {n_classes_list}")

            self.n_classes  = n_classes_list
            self.class_maps = ckpt.get("class_maps", None)

            self.model = UserBehaviorModel(self.vocab.size, n_classes_list, self.cfg)
            self.model.load_state_dict(ckpt["model_state"])
            self.model.to(self.device)
            self.model.eval()

            self.is_loaded = True
            logger.info(
                f"✅ Model loaded | vocab={self.vocab.size} | "
                f"n_classes={n_classes_list} | device={self.device}"
            )
        except Exception as e:
            logger.error(f"❌ Load model thất bại: {e}", exc_info=True)

    def predict(self, sequence: list[int]) -> dict:
        if not self.is_loaded:
            return self._stub_predict()

        max_seq_len = self.cfg["max_seq_len"]
        with torch.no_grad():
            seq_t, mask_t, meta_t = _preprocess(sequence, self.vocab, max_seq_len, self.device)
            logits_list = self.model(seq_t, mask_t, meta_t)

        result, probs_list = {}, []
        for i, logits in enumerate(logits_list):
            probs      = torch.softmax(logits[0], dim=-1)
            pred_idx   = int(probs.argmax().item())
            confidence = float(probs[pred_idx].item())
            if self.class_maps and i < len(self.class_maps):
                pred_value = int(self.class_maps[i].get(pred_idx, pred_idx))
            else:
                pred_value = pred_idx
            result[f"attr_{i + 1}"] = pred_value
            probs_list.append(round(confidence, 4))

        result["probabilities"] = probs_list
        return result

    def get_feature_importance(self, sequence: list[int]) -> list[float]:
        if not self.is_loaded:
            import random
            return [round(random.uniform(0, 1), 3) for _ in sequence]

        max_seq_len = self.cfg["max_seq_len"]
        seq_t, mask_t, meta_t = _preprocess(sequence, self.vocab, max_seq_len, self.device)

        try:
            scores = _compute_importance(self.model, seq_t, mask_t, meta_t)
        except Exception as e:
            logger.warning(f"Feature importance lỗi: {e}")
            scores = [0.0] * min(len(sequence), max_seq_len)

        expected = min(len(sequence), max_seq_len)
        scores   = scores[:expected]
        if len(scores) < expected:
            scores = [0.0] * (expected - len(scores)) + scores
        return scores

    @staticmethod
    def _stub_predict() -> dict:
        import random
        attrs = {f"attr_{i + 1}": random.randint(0, 65535) for i in range(6)}
        probs = [round(random.uniform(0.4, 0.99), 4) for _ in range(6)]
        return {**attrs, "probabilities": probs}

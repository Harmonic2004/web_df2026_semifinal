"""
similarity.py — Tìm Top-K sequence tương đồng từ X_train.csv.

Ưu tiên:
  1. CLS Embedding Cosine  — dùng model Transformer (chính xác nhất)
  2. Bag-of-Words Cosine   — fallback khi chưa có model

Cách dùng:
  - Gọi init_similarity(x_train_path) khi khởi động app.
  - Gọi build_embeddings(predictor) sau khi model loaded.
  - Gọi find_top_similar(query_sequence, top_k=3) để tìm kết quả.
"""

import os
import math
import logging
import pandas as pd
import torch

logger = logging.getLogger(__name__)

# ── Config ────────────────────────────────────────────────────────────────────
FEATURE_COLS  = [f"feature_{i}" for i in range(1, 38)]
X_TRAIN_PATH  = os.path.join(
    os.path.dirname(__file__), "..", "..", "data", "X_train.csv"
)

# ── State (được populate khi init) ────────────────────────────────────────────
_records: list[dict] = []          # [{"customer_id": str, "sequence": list[int]}]
_embeddings: torch.Tensor = None   # [N, embed_dim] — CLS vectors precomputed


# ═══════════════════════════════════════════════════════════════════════════════
#  INIT — Load X_train.csv
# ═══════════════════════════════════════════════════════════════════════════════

def init_similarity(path: str = X_TRAIN_PATH):
    global _records, _embeddings

    if not os.path.exists(path):
        logger.warning(f"X_train.csv không tìm thấy tại: {path}")
        return

    try:
        df = pd.read_csv(path)
        records = []
        for _, row in df.iterrows():
            customer_id = str(row["id"]) if "id" in row else str(row.name)
            seq = [
                int(float(v))
                for col in FEATURE_COLS
                if col in row and pd.notna(row[col])
                for v in [row[col]]
            ]
            if seq:
                records.append({"customer_id": customer_id, "sequence": seq})
        _records = records
        logger.info(f"✅ Loaded {len(_records)} sequences")
    except Exception as e:
        logger.error(f"❌ Load X_train thất bại: {e}")
        return

    # Load embeddings.pt nếu có sẵn
    emb_path = os.path.join(os.path.dirname(__file__), "..", "..", "model_weights", "embeddings.pt")
    if os.path.exists(emb_path):
        _embeddings = torch.load(emb_path, map_location="cpu")
        logger.info(f"✅ Loaded embeddings: {list(_embeddings.shape)}")
    else:
        logger.warning("embeddings.pt chưa có — chạy precompute_embeddings.py")



# ═══════════════════════════════════════════════════════════════════════════════
#  FIND TOP SIMILAR
# ═══════════════════════════════════════════════════════════════════════════════

def find_top_similar(query: list[int], top_k: int = 3, predictor=None) -> list[dict]:
    """
    Tìm top_k sequences tương đồng nhất với query.
    - Nếu có embeddings precomputed → dùng CLS cosine similarity.
    - Nếu không → fallback về Bag-of-Words cosine.
    """
    if not _records:
        return []

    if _embeddings is not None and predictor is not None and predictor.is_loaded:
        return _embedding_similarity(query, top_k, predictor)
    else:
        return _bow_similarity(query, top_k)


# ── Cách A: Bag-of-Words Cosine ───────────────────────────────────────────────

def _to_bag(seq: list[int]) -> dict[int, int]:
    bag: dict[int, int] = {}
    for v in seq:
        bag[v] = bag.get(v, 0) + 1
    return bag


def _cosine_bow(a: list[int], b: list[int]) -> float:
    ba, bb = _to_bag(a), _to_bag(b)
    keys   = set(ba) | set(bb)
    dot    = sum(ba.get(k, 0) * bb.get(k, 0) for k in keys)
    norm_a = math.sqrt(sum(v ** 2 for v in ba.values()))
    norm_b = math.sqrt(sum(v ** 2 for v in bb.values()))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def _bow_similarity(query: list[int], top_k: int) -> list[dict]:
    scored = []
    for rec in _records:
        sim = _cosine_bow(query, rec["sequence"])
        scored.append({
            "customer_id":      rec["customer_id"],
            "sequence_snippet": rec["sequence"][:10],
            "similarity":       round(sim * 100, 1),
        })
    scored.sort(key=lambda x: x["similarity"], reverse=True)
    return scored[:top_k]


# ── Cách B: CLS Embedding Cosine ─────────────────────────────────────────────

def _embedding_similarity(query: list[int], top_k: int, predictor) -> list[dict]:
    from app.models.predictor import _preprocess

    model       = predictor.model
    vocab       = predictor.vocab
    cfg         = predictor.cfg
    device      = predictor.device
    max_seq_len = cfg["max_seq_len"]

    model.eval()
    with torch.no_grad():
        seq_t, mask_t, _ = _preprocess(query, vocab, max_seq_len, device)
        query_vec = model.encoder(seq_t, mask_t).squeeze(0).cpu()  # [embed_dim]

    # Cosine similarity vectorized: [N]
    db_norm    = _embeddings / (_embeddings.norm(dim=1, keepdim=True) + 1e-9)
    q_norm     = query_vec   / (query_vec.norm() + 1e-9)
    sims       = (db_norm @ q_norm).tolist()   # [N]

    scored = []
    for i, sim in enumerate(sims):
        scored.append({
            "customer_id":      _records[i]["customer_id"],
            "sequence_snippet": _records[i]["sequence"][:10],
            "similarity":       round(sim * 100, 1),
        })

    scored.sort(key=lambda x: x["similarity"], reverse=True)
    return scored[:top_k]

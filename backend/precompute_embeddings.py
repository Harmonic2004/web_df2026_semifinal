import torch
from app.models.predictor import ModelPredictor, _preprocess
from app.utils import similarity                  # ← import module

predictor = ModelPredictor()
predictor.load()
similarity.init_similarity()

print(similarity._records)                        # ← truy cập qua module

model       = predictor.model
vocab       = predictor.vocab
max_seq_len = predictor.cfg["max_seq_len"]
device      = predictor.device

model.eval()
vecs = []
with torch.no_grad():
    for rec in similarity._records:               # ← truy cập qua module
        seq_t, mask_t, _ = _preprocess(rec["sequence"], vocab, max_seq_len, device)
        cls_vec = model.encoder(seq_t, mask_t).squeeze(0).cpu()
        vecs.append(cls_vec)

embeddings = torch.stack(vecs)
torch.save(embeddings, "model_weights/embeddings.pt")
print(f"✅ Saved {embeddings.shape} → model_weights/embeddings.pt")
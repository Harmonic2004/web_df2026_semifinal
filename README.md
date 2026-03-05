# Dataflow 2026 – User Behavior Prediction

A modern SPA dashboard for demo-ing a user-behavior prediction model.

---

## Project Structure

```
dataflow-2026/
├── frontend/                   # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── InputSection.jsx      ← raw text + batch file upload
│   │   │   ├── AttributeCard.jsx     ← single UINT16 result card
│   │   │   ├── PredictionOutputs.jsx ← 6-card grid
│   │   │   ├── ExplainabilityPanel.jsx ← token heatmap
│   │   │   └── SimilarSequences.jsx  ← top-3 similarity table
│   │   ├── hooks/
│   │   │   └── usePrediction.js      ← prediction state machine
│   │   ├── services/
│   │   │   └── api.js                ← all HTTP calls
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js          ← proxies /api → localhost:8000
│   └── package.json
│
└── backend/                    # FastAPI
    ├── app/
    │   ├── main.py             ← FastAPI app + CORS + lifespan
    │   ├── routers/
    │   │   └── prediction.py   ← POST /predict, /predict/batch, /explain
    │   ├── schemas/
    │   │   └── prediction.py   ← Pydantic models
    │   ├── models/
    │   │   └── predictor.py    ← ★ PUT YOUR MODEL HERE ★
    │   └── utils/
    │       └── similarity.py   ← cosine similarity (swap with DB)
    ├── model_weights/          ← drop .pt / .onnx / .pkl here
    └── requirements.txt
```

---

## Quick Start

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev          # → http://localhost:5173
```

---

## Integrating Your Model

Edit `backend/app/models/predictor.py`:

1. **`load()`** — load your weights from `model_weights/`
2. **`predict(sequence)`** — run inference, return `{attr_1…attr_6, probabilities}`
3. **`get_feature_importance(sequence, attr)`** — return per-token scores `[0, 1]`

Supported frameworks: PyTorch, ONNX Runtime, scikit-learn/joblib — examples are commented in the file.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/predict` | Single sequence prediction |
| `POST` | `/api/v1/predict/batch` | Batch CSV/TXT → JSON download |
| `POST` | `/api/v1/explain` | Feature importance for a target attr |
| `GET`  | `/health` | Health check |

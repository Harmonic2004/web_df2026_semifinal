import csv
import io
import json
from fastapi import APIRouter, Request, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from app.schemas.prediction import PredictRequest, PredictResponse
from app.utils.similarity import find_top_similar

router = APIRouter()


def _run_single(predictor, sequence: list[int]) -> dict:
    prediction = predictor.predict(sequence)
    importance = predictor.get_feature_importance(sequence)
    similar    = find_top_similar(sequence, predictor=predictor)
    return {
        "prediction":      prediction,
        "explainability":  {"token_importance": importance},
        "similar_sequences": similar,
    }


@router.post("/predict", response_model=PredictResponse)
async def predict(req: PredictRequest, request: Request):
    predictor = request.app.state.predictor
    if not predictor.is_loaded:
        raise HTTPException(503, "Model not loaded.")
    return _run_single(predictor, req.sequence)


@router.post("/predict/batch")
async def predict_batch(request: Request, file: UploadFile = File(...)):
    predictor = request.app.state.predictor
    if not predictor.is_loaded:
        raise HTTPException(503, "Model not loaded.")

    content = await file.read()
    text    = content.decode("utf-8", errors="replace")
    results = []

    if file.filename.endswith(".csv"):
        reader = csv.reader(io.StringIO(text))
        for i, row in enumerate(reader):
            if not row:
                continue
            row_id = row[0] if row else str(i)
            try:
                if len(row) == 2:
                    seq = [int(float(x)) for x in row[1].split()]
                else:
                    seq = [int(float(x)) for x in row[1:] if x.strip()]
                pred = predictor.predict(seq)
                results.append({"row_id": row_id, **pred})
            except Exception as e:
                results.append({"row_id": row_id, "error": str(e)})
    else:
        for i, line in enumerate(text.splitlines()):
            line = line.strip()
            if not line:
                continue
            try:
                seq = [int(float(x)) for x in line.split()]
                pred = predictor.predict(seq)
                results.append({"row_id": str(i + 1), **pred})
            except Exception as e:
                results.append({"row_id": str(i + 1), "error": str(e)})

    output = json.dumps({"results": results, "total": len(results)}, indent=2)
    return StreamingResponse(
        io.BytesIO(output.encode()),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=predictions.json"},
    )

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routers import prediction
from app.models.predictor import ModelPredictor
from app.utils.similarity import init_similarity

predictor_instance: ModelPredictor = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    predictor = ModelPredictor()
    predictor.load()
    app.state.predictor = predictor

    init_similarity()   # load CSV + embeddings.pt luôn trong này

    yield


app = FastAPI(
    title="Dataflow 2026 - User Behavior Prediction API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prediction.router, prefix="/api/v1", tags=["prediction"])

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "model_loaded": app.state.predictor.is_loaded,
    }

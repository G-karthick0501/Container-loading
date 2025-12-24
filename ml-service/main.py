from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np

from schemas import PredictionRequest, PredictionResponse, AlgorithmResponse
from services import model_loader  # Import module, not variables
from services.features import extract_utilization_features, extract_algorithm_features

app = FastAPI(title="Container Loading ML Service", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    model_loader.load_all_models()


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "utilization_model": model_loader.UTILIZATION_LOADED,
        "algorithm_model": model_loader.ALGORITHM_LOADED
    }


@app.post("/predict", response_model=PredictionResponse)
def predict_utilization(req: PredictionRequest):
    if not model_loader.UTILIZATION_LOADED:
        raise HTTPException(503, "Utilization model not loaded")
    
    features = extract_utilization_features(req.items, req.container)
    pred = float(np.clip(model_loader.utilization_model.predict([features])[0], 0, 1))
    fill = features[3]
    
    return {
        "predicted_utilization": round(pred, 4),
        "predicted_percentage": f"{pred * 100:.1f}%",
        "confidence": "low" if fill > 1 else "high" if 0.3 < fill < 0.95 else "medium",
        "feature_summary": {
            "num_types": int(features[0]),
            "total_items": int(features[1]),
            "fill_ratio": round(fill, 3),
            "volume_std": round(features[7], 2)
        }
    }


@app.post("/predict-algorithm", response_model=AlgorithmResponse)
def predict_algorithm(req: PredictionRequest):
    if not model_loader.ALGORITHM_LOADED:
        raise HTTPException(503, "Algorithm model not loaded")
    
    features = extract_algorithm_features(req.items, req.container)
    X = np.array([[
        features["num_item_types"],
        features["total_items"],
        features["fill_ratio"],
        features["size_variance_normalized"],
        features["avg_aspect_ratio"]
    ]])
    X_scaled = model_loader.scaler.transform(X)
    
    pred = model_loader.algorithm_model.predict(X_scaled)[0]
    probs = model_loader.algorithm_model.predict_proba(X_scaled)[0]
    algo = model_loader.label_encoder.inverse_transform([pred])[0]
    
    return {
        "recommended_algorithm": algo,
        "confidence": round(float(max(probs)), 4),
        "features": features,
        "all_probabilities": {
            model_loader.label_encoder.inverse_transform([i])[0]: round(float(p), 4)
            for i, p in enumerate(probs)
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
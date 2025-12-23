from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import joblib
import numpy as np
import os

# Initialize FastAPI
app = FastAPI(
    title="Container Loading ML Service",
    description="Predicts container utilization using Random Forest model",
    version="1.0.0"
)

# CORS - allow Node.js backend to call this
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model on startup
MODEL_PATH = os.getenv("MODEL_PATH", "utilization_predictor.joblib")
model = None

@app.on_event("startup")
def load_model():
    global model
    try:
        model = joblib.load(MODEL_PATH)
        print(f"✅ Model loaded from {MODEL_PATH}")
    except Exception as e:
        print(f"❌ Failed to load model: {e}")


# --- Request/Response Models ---

class Item(BaseModel):
    length: float
    width: float
    height: float
    quantity: Optional[int] = 1

class Container(BaseModel):
    length: float
    width: float
    height: float

class PredictionRequest(BaseModel):
    items: List[Item]
    container: Container

class PredictionResponse(BaseModel):
    predicted_utilization: float
    predicted_percentage: str
    confidence: str
    feature_summary: dict


# --- Feature Extraction ---
# TODO: Update this to match your exact Colab features

def extract_features(items: List[Item], container: Container) -> List[float]:
    """
    Extract the exact 10 features used in training.
    Order: num_types, total_items, items_per_type, fill_ratio, avg_box_volume,
           max_box_volume, min_box_volume, volume_std, avg_box_ratio, max_box_ratio
    """
    # Container volume
    container_volume = container.length * container.width * container.height
    
    # Expand all boxes by quantity (like training data)
    all_volumes = []
    total_items = 0
    
    for item in items:
        box_volume = item.length * item.width * item.height
        qty = item.quantity if item.quantity else 1
        total_items += qty
        for _ in range(qty):
            all_volumes.append(box_volume)
    
    # Calculate features
    num_types = len(items)
    items_per_type = total_items / num_types if num_types > 0 else 0
    
    total_item_volume = sum(all_volumes)
    fill_ratio = total_item_volume / container_volume if container_volume > 0 else 0
    
    avg_box_volume = sum(all_volumes) / len(all_volumes) if all_volumes else 0
    max_box_volume = max(all_volumes) if all_volumes else 0
    min_box_volume = min(all_volumes) if all_volumes else 0
    
    # Standard deviation (population std, not sample)
    if all_volumes:
        mean_vol = avg_box_volume
        volume_std = (sum((v - mean_vol) ** 2 for v in all_volumes) / len(all_volumes)) ** 0.5
    else:
        volume_std = 0
    
    # Ratios normalized by container
    avg_box_ratio = avg_box_volume / container_volume if container_volume > 0 else 0
    max_box_ratio = max_box_volume / container_volume if container_volume > 0 else 0
    
    # Return in exact training order!
    features = [
        num_types,        # 1
        total_items,      # 2
        items_per_type,   # 3
        fill_ratio,       # 4
        avg_box_volume,   # 5
        max_box_volume,   # 6
        min_box_volume,   # 7
        volume_std,       # 8
        avg_box_ratio,    # 9
        max_box_ratio,    # 10
    ]
    
    return features
# --- API Endpoints ---

@app.get("/")
def root():
    return {
        "service": "Container Loading ML Service",
        "status": "running",
        "model_loaded": model is not None
    }


@app.get("/health")
def health_check():
    """Health check endpoint for Docker/Kubernetes"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return {
        "status": "healthy",
        "model_loaded": True
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    """Predict container utilization"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    # Extract features
    features = extract_features(request.items, request.container)
    
    # Make prediction
    prediction = model.predict([features])[0]
    
    # Clamp to valid range
    prediction = max(0.0, min(1.0, prediction))
    
    # Determine confidence based on fill ratio (features[3], not features[0]!)
    fill_ratio = features[3]  # <-- FIXED: was features[0]
    if fill_ratio > 1.0:
        confidence = "low"  # Impossible to fit everything
    elif 0.3 < fill_ratio < 0.95:
        confidence = "high"
    else:
        confidence = "medium"
    
    return {
        "predicted_utilization": round(prediction, 4),
        "predicted_percentage": f"{prediction * 100:.1f}%",
        "confidence": confidence,
        "feature_summary": {
            "num_types": int(features[0]),
            "total_items": int(features[1]),
            "fill_ratio": round(fill_ratio, 3),
            "volume_std": round(features[7], 2)
        }
    }

# --- Run directly for development ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
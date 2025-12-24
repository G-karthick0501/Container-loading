from pydantic import BaseModel
from typing import List, Optional

class Item(BaseModel):
    length: float
    width: float
    height: float
    quantity: Optional[int] = 1
    weight: Optional[float] = 1.0

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

class AlgorithmResponse(BaseModel):
    recommended_algorithm: str
    confidence: float
    features: dict
    all_probabilities: dict
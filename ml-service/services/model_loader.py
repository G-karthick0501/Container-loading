import joblib
import os

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")

# Model instances
utilization_model = None
algorithm_model = None
scaler = None
label_encoder = None

# Status flags
UTILIZATION_LOADED = False
ALGORITHM_LOADED = False


def load_all_models():
    """Load all ML models on startup"""
    global utilization_model, algorithm_model, scaler, label_encoder
    global UTILIZATION_LOADED, ALGORITHM_LOADED
    
    # Utilization Predictor
    try:
        path = os.path.join(MODEL_DIR, "utilization_predictor.joblib")
        utilization_model = joblib.load(path)
        UTILIZATION_LOADED = True
        print(f"✅ Utilization model loaded")
    except Exception as e:
        print(f"⚠️ Utilization model failed: {e}")
    
    # Algorithm Selector
    try:
        algorithm_model = joblib.load(os.path.join(MODEL_DIR, "algorithm_selector.pkl"))
        scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))
        label_encoder = joblib.load(os.path.join(MODEL_DIR, "label_encoder.pkl"))
        ALGORITHM_LOADED = True
        print("✅ Algorithm selector loaded")
    except Exception as e:
        print(f"⚠️ Algorithm selector failed: {e}")
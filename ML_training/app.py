from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
import uvicorn

app = FastAPI()

# 1. Load both trained ML models
try:
    model_risk = joblib.load('stack_model_risk.pkl')
    model_delay = joblib.load('stack_model_delay.pkl')
    print("✅ ML Models loaded successfully!")
except Exception as e:
    print(f"❌ Error loading models: {e}")

# List of features used during time of training
feature_cols = ['sla_days', 'defect_rate', 'weather_hazard', 'location_risk', 'worker_load', 'total_pending_tasks']

# Format defined for input validation
class PredictionInput(BaseModel):
    sla_days: int
    defect_rate: float
    weather_hazard: float
    location_risk: float
    worker_load: int
    total_pending_tasks: int

@app.post("/predict")
def predict_metrics(data: PredictionInput):
    # Node.js se aaye data ko Pandas DataFrame me convert kiya (Feature names ke sath)
    input_df = pd.DataFrame([[
        data.sla_days,
        data.defect_rate,
        data.weather_hazard,
        data.location_risk,
        data.worker_load,
        data.total_pending_tasks
    ]], columns=feature_cols)
    
    # Live predictions run
    pred_risk = round(model_risk.predict(input_df)[0])
    pred_delay = round(model_delay.predict(input_df)[0], 1)
    
    # Safe limits set (0-100 for risk, non-negative for delay)
    pred_risk = min(max(pred_risk, 0), 100)
    pred_delay = max(pred_delay, 0.0)
    
    return {
        "riskPercentage": pred_risk,
        "expectedDelayDays": pred_delay
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)

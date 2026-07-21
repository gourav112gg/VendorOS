import joblib
import numpy as np
import pandas as pd  # <-- Pandas import karo
import warnings
warnings.filterwarnings('ignore')  # for warning ignorances

model_risk = joblib.load('stack_model_risk.pkl')
model_delay = joblib.load('stack_model_delay.pkl')

# Dataframe is created by feature names
feature_cols = ['sla_days', 'defect_rate', 'weather_hazard', 'location_risk', 'worker_load', 'total_pending_tasks']
live_data = pd.DataFrame([[3, 0.12, 0.85, 0.40, 6, 25]], columns=feature_cols)

# Start Prediction
pred_risk = round(model_risk.predict(live_data)[0])
pred_delay = round(model_delay.predict(live_data)[0], 1)

print(f"Stacking Predicted Risk Score: {pred_risk} / 100")
print(f"Stacking Predicted Expected Delay: {pred_delay} days")
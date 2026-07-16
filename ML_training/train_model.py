import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.multioutput import MultiOutputRegressor
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.ensemble import RandomForestRegressor, AdaBoostRegressor, StackingRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

df = pd.read_csv('vendor_risk_dataset.csv')
feature_cols = ['sla_days', 'defect_rate', 'weather_hazard', 'location_risk', 'worker_load', 'total_pending_tasks']
X = df[feature_cols]
y = df[['risk_score', 'delay_expected_days']]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

models = {
    'Linear Regression': MultiOutputRegressor(LinearRegression()),
    'Ridge Regression': MultiOutputRegressor(Ridge(alpha=1.0)),
    'Lasso Regression': MultiOutputRegressor(Lasso(alpha=0.1)),
    'Random Forest': MultiOutputRegressor(RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)),
    'AdaBoost': MultiOutputRegressor(AdaBoostRegressor(n_estimators=50, random_state=42))
}

print("--- Base Models Evaluation ---")
for name, model in models.items():
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    print(f"[{name}] Risk R²: {r2_score(y_test['risk_score'], preds[:, 0])*100:.1f}%, Delay R²: {r2_score(y_test['delay_expected_days'], preds[:, 1])*100:.1f}%")

print("\n--- Training Stacking Regressor ---")
base_estimators = [
    ('lr', LinearRegression()), ('ridge', Ridge(alpha=1.0)), ('lasso', Lasso(alpha=0.1)),
    ('rf', RandomForestRegressor(n_estimators=50, max_depth=8, random_state=42)),
    ('ada', AdaBoostRegressor(n_estimators=50, random_state=42))
]

stack_risk = StackingRegressor(estimators=base_estimators, final_estimator=LinearRegression())
stack_delay = StackingRegressor(estimators=base_estimators, final_estimator=LinearRegression())

stack_risk.fit(X_train, y_train['risk_score'])
stack_delay.fit(X_train, y_train['delay_expected_days'])

joblib.dump(stack_risk, 'stack_model_risk.pkl')
joblib.dump(stack_delay, 'stack_model_delay.pkl')
print("Stacking models saved successfully!")
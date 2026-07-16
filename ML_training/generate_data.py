import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def generate_vendor_dataset(num_records=5000):
    np.random.seed(42)
    defect_rates = np.random.beta(a=2, b=5, size=num_records) * 0.3
    weather_hazard = np.random.uniform(0, 1, size=num_records)
    location_risk = np.random.uniform(0, 1, size=num_records)
    worker_load = np.random.randint(1, 10, size=num_records)
    total_pending_tasks = np.random.randint(5, 50, size=num_records)
    
    base_date = datetime(2026, 1, 1)
    order_dates = [base_date + timedelta(days=int(np.random.randint(0, 180))) for _ in range(num_records)]
    sla_days = np.random.choice([1, 2, 3, 5, 7], size=num_records, p=[0.1, 0.2, 0.4, 0.2, 0.1])
    delivery_dates = [order_dates[i] + timedelta(days=int(sla_days[i])) for i in range(num_records)]
    
    noise = np.random.normal(0, 5, size=num_records)
    risk_scores = ((defect_rates * 150) + (weather_hazard * 25) + (location_risk * 20) + 
                   (worker_load * 3) + (total_pending_tasks * 0.4) + (10 / sla_days) + noise)
    risk_scores = np.clip(risk_scores, 0, 100)
    
    delay_expected = np.where(risk_scores > 70, np.random.uniform(2, 5, size=num_records),
                              np.where(risk_scores > 40, np.random.uniform(0.5, 2, size=num_records), 0))
    delay_expected = np.round(delay_expected, 1)

    df = pd.DataFrame({
        'order_date': [d.strftime('%Y-%m-%d') for d in order_dates],
        'delivery_date': [d.strftime('%Y-%m-%d') for d in delivery_dates],
        'sla_days': sla_days,
        'defect_rate': np.round(defect_rates, 3),
        'weather_hazard': np.round(weather_hazard, 2),
        'location_risk': np.round(location_risk, 2),
        'worker_load': worker_load,
        'total_pending_tasks': total_pending_tasks,
        'risk_score': np.round(risk_scores, 0).astype(int),
        'delay_expected_days': delay_expected
    })
    return df

dataset = generate_vendor_dataset(5000)
dataset.to_csv('vendor_risk_dataset.csv', index=False)
print("Dataset saved to 'vendor_risk_dataset.csv'!")
dataset.head(15)
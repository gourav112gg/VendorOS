FROM node:20-slim

# Install Python 3, pip, and system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Node dependency manifests and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Install Python dependencies for ML model and FastAPI
RUN pip3 install --no-cache-dir --break-system-packages \
    fastapi \
    uvicorn \
    pandas \
    pydantic \
    scikit-learn \
    joblib

# Copy backend source code, ML service, and startup script
COPY src ./src
COPY ML_training ./ML_training
COPY start.sh ./start.sh

# Ensure executable permissions on startup script
RUN chmod +x ./start.sh

EXPOSE 5000 8000

ENV PORT=5000
ENV NODE_ENV=production

CMD ["./start.sh"]

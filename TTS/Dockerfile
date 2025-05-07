# # FROM python:3.9-slim
# FROM python:3.9-slim-bullseye
# WORKDIR /app
# COPY . /app

# # RUN apt-get update && apt-get install -y \
# #     build-essential libsndfile1 \
# #     && rm -rf /var/lib/apt/lists/*

# RUN pip install --upgrade pip

# #install dependencies thru setup.py
# RUN pip install .

# EXPOSE 8888
# CMD ["uvicorn", "main:app",  "--host", "0.0.0.0", "--port", "8888"]

# --------------------
# Stage 1: Build Image
# --------------------
FROM python:3.9.18-slim-bullseye AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libsndfile1-dev \
    && rm -rf /var/lib/apt/lists/*
    
WORKDIR /app
COPY . /app
    
# Install Python dependencies to /install
RUN pip install --upgrade pip \
    && pip install --prefix=/install .
    
# --------------------
# Stage 2: Runtime Image
# --------------------
FROM python:3.9.18-slim-bullseye
    
# Install only runtime lib (e.g., libsndfile needed for audio)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy installed site-packages from builder stage
COPY --from=builder /install /usr/local
COPY . /app

EXPOSE 8888

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8888"]
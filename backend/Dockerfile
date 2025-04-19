FROM python:3.11.3 AS builder

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1
WORKDIR /app


# Create a virtual environment
RUN python -m venv .venv
COPY requirements.txt ./

# Install dependencies in the virtual environment
RUN .venv/bin/pip install --upgrade pip && \
    .venv/bin/pip install -r requirements.txt

# Clone and install MeloTTS
RUN git clone https://github.com/myshell-ai/MeloTTS.git && \
    .venv/bin/pip install -e MeloTTS && \
    .venv/bin/python -m unidic download

# Copy everything else in /backend
COPY . .

# Final runtime image
FROM python:3.11.3-slim
WORKDIR /app

# Copies image from builder into the runtime image
COPY --from=builder /app /app

# Call univcorn command main:app to start backend
CMD ["/app/.venv/bin/uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]




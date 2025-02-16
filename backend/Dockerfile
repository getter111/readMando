FROM python:3.11.3 AS builder

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1
WORKDIR /app


# Create a virtual environment
RUN python -m venv .venv
COPY requirements.txt ./
# Install dependencies in the virtual environment
RUN .venv/bin/pip install -r requirements.txt

FROM python:3.11.3-slim
WORKDIR /app

COPY --from=builder /app/.venv .venv/
COPY . .

#CMD ["/app/.venv/bin/fastapi", "run"]
CMD ["/app/.venv/bin/uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]


#flyctl scale count 1 (starts the instance)
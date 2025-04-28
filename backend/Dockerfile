# FROM python:3.11.3 AS builder

# ENV PYTHONUNBUFFERED=1 \
#     PYTHONDONTWRITEBYTECODE=1

# WORKDIR /app

# RUN python -m venv .venv

# COPY requirements.txt ./
# COPY MeloTTS ./MeloTTS

# RUN .venv/bin/pip install -r requirements.txt
# RUN .venv/bin/python -m unidic download

# FROM python:3.11.3-slim

# WORKDIR /app

# COPY --from=builder /app/.venv .venv/
# COPY . .

# EXPOSE 8000
# CMD ["/app/.venv/bin/uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]


# Base image
FROM python:3.11-slim

# Set working directory to /app inside the container
WORKDIR /app

# Copy the whole project from the /backend folder to /app in the container (should be ran in /backend)
COPY . .

RUN pip install --upgrade pip
RUN pip install -r requirements.txt
# RUN python -m unidic download

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

#after build run: docker run --env-file .env -p 8080:8000 my-fastapi-app
FROM python:3.11-slim

# Set working directory to /app inside the container
WORKDIR /app

# Copy the whole project from the /backend folder to /app in the container (should be ran in /backend)
COPY . .

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
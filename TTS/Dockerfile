FROM python:3.9-slim
WORKDIR /app
COPY . /app

RUN apt-get update && apt-get install -y \
    build-essential libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip

#install dependencies thru setup.py
RUN pip install .

CMD ["uvicorn", "main:app",  "--host", "0.0.0.0", "--port", "8888"]
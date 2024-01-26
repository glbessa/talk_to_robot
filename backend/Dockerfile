FROM python:3.8-slim-buster

WORKDIR /usr/src/api

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "app:app"]
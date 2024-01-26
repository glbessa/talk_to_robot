FROM python:3.8-slim-buster

WORKDIR /usr/src/backend

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

WORKDIR /usr/src/backend/src

CMD ["gunicorn", "wsgi:app"]

#ENTRYPOINT ["tail", "-f", "/dev/null"]
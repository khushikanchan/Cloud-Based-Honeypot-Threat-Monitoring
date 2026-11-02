FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000
EXPOSE 8080
EXPOSE 2222
EXPOSE 2121

CMD ["python", "app.py"]
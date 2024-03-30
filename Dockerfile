FROM python:3 AS builder
 
WORKDIR /app
 
RUN python3 -m venv venv
ENV VIRTUAL_ENV=/app/venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

COPY requirements.txt .
RUN pip install -r requirements.txt
 
# Stage 2
FROM python:3 AS runner
 
WORKDIR /app
 
COPY --from=builder /app/venv venv
COPY main.py main.py
 
ENV VIRTUAL_ENV=/app/venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

EXPOSE 8000
 
CMD ["python", "main.py"]
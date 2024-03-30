FROM python:3 AS builder

WORKDIR /app

COPY ./app/ .

RUN python3 -m venv venv
ENV VIRTUAL_ENV=/app/venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

RUN pip install -r requirements.txt
RUN ls /app; pwd

ENV VIRTUAL_ENV=/app/venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

EXPOSE 8000
 
CMD ["python", "main.py"]
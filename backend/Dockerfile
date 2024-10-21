FROM python:3.10

RUN apt update \
	&& apt install -y --no-install-recommends postgresql-client \
    netcat-traditional \
	&& rm -rf /var/lib/apt/lists/*

# set environment variables
# make it read-only files and reduce disk usage
ENV PYTHONDONTWRITEBYTECODE 1
# flush the console and log immediately
ENV PYTHONUNBUFFERED 1

WORKDIR /usr/src/app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
#RUN sed -i 's/, is_dst=False//' /usr/local/lib/python3.12/site-packages/django_seed/guessers.py

COPY ./entrypoint.sh /usr/local/bin
RUN chmod +x /usr/local/bin/entrypoint.sh
COPY . .

EXPOSE 8000

ENTRYPOINT [ "/usr/local/bin/entrypoint.sh" ]

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

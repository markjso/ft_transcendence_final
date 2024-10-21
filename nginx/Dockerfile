FROM nginx:latest

RUN apt-get -y update && apt-get -y upgrade
RUN apt-get install -y openssl

COPY ./proxy_params /etc/nginx/proxy_params
COPY ./default.conf /etc/nginx/conf.d

COPY ./nginx.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/nginx.sh

CMD ["/usr/local/bin/nginx.sh"]

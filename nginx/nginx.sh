#!/bin/bash

# Request and Generate the private key and Certificate.
openssl req -newkey rsa:4096 -x509 -sha256 -days 365 -nodes \
       -out /etc/ssl/certs/42adel.crt \
       -keyout /etc/ssl/private/42adel.key \
       -subj "/C=AU/ST=SA/L=Adelaide/O=42 School/OU=42adel/CN=42adel.42.fr/"

# Start the nginx daemon
nginx -g "daemon off;"

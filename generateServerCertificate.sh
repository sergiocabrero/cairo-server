echo "If a signed certificate is needed, look for options like: https://certbot.eff.org/lets-encrypt/"
echo "chooseserverpassphrase" > passphrase.txt
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -passout file:passphrase.txt -keyout key.pem -out cert.pem

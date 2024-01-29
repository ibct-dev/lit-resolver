docker run -d -p 8080:8080 --env LEDGIS_LIT_ENDPOINT=https://renault-nodeapi.identitydatahub.com --env LEDGIS_LIT_CODE=led.lit --name lit-resolver ibct/driver-did-lit:latest

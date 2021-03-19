![DIF Logo](https://raw.githubusercontent.com/decentralized-identity/universal-resolver/master/docs/logo-dif.png)

# Universal Resolver Driver: did:lit

This is a [Universal Resolver](https://github.com/decentralized-identity/universal-resolver/) driver for **did:lit** identifiers.

## Specifications

* [Decentralized Identifiers](https://w3c.github.io/did-core/)
* [DID Method Spec](https://github.com/ibct-dev/lit-DID/blob/main/docs/did:lit-method-spec_eng_v0.1.0.md)

## Example DIDs

```
did:lit:AEZ87t1bi5bRxmVh3ksMUi
```

## Build and Run (Docker)

```
docker build -f ./docker/Dockerfile . -t ibct/driver-did-lit
docker run -d -p 8080:8080 --env LEDGIS_LIT_ENDPOINT=https://lit.ledgis.io --env LEDGIS_LIT_CODE=lit --name lit-resolver ibct/driver-did-lit
curl -X GET http://localhost:8080/1.0/identifiers/did:lit:AEZ87t1bi5bRxmVh3ksMUi
```

## Build and Run (NodeJS)

```
yarn start
```

## Driver Environment Variables

The driver recognizes the following environment variables:

### `LEDGIS_LIT_ENDPOINT`

 * The endpoint of node for JSON-RPC
 * Default value(lit chain): `https://lit.ledgis.io`

### `LEDGIS_LIT_CODE`

 * The code of lit did contract
 * Default value: `lit`

## Driver Metadata

The driver returns the following metadata in addition to a DID document:

none
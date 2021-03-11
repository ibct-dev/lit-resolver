import { registerAs } from "@nestjs/config";

export default registerAs("ledgis", () => ({
    nodeEndpoint: process.env.LEDGIS_ENDPOINT || "https://identifier.ledgis.io",
    code: process.env.LEDGIS_LIT_CODE || "identifier",
    privateKeys: process.env.LEDGIS_PRIVATE_KEYS
        ? process.env.LEDGIS_PRIVATE_KEYS.split(" ")
        : [],
    hasuraEndpoint: process.env.LEDGIS_HASURA_ENDPOINT || "",
}));

import { registerAs } from "@nestjs/config";

export default registerAs("ledgis", () => ({
    nodeEndpoint: process.env.LEDGIS_LIT_ENDPOINT || "https://lit.ledgis.io",
    code: process.env.LEDGIS_LIT_CODE || "lit",
}));

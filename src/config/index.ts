import { config as _config } from "dotenv";
_config({ path: __dirname + "/../../.env" });
(process as any).send = process.send || function () {};

import { appConfig } from "./app.config";
import { swaggerConfig } from "./swagger.config";
import { loggerDbConfig } from "./logger-db.config";

import LoggerModuleConfig from "./modules/logger.config";
import LedgisModuleConfig from "./modules/ledgis.config";

export {
    appConfig,
    swaggerConfig,
    loggerDbConfig,
    LoggerModuleConfig,
    LedgisModuleConfig,
};

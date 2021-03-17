import { config as _config } from "dotenv";
_config({ path: __dirname + "/../../.env" });
(process as any).send = process.send || function () {};

import { appConfig } from "./app.config";

import LoggerModuleConfig from "./modules/logger.config";
import LedgisModuleConfig from "./modules/ledgis.config";

export { appConfig, LoggerModuleConfig, LedgisModuleConfig };

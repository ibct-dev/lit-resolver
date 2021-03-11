import { Inject, Injectable } from "@nestjs/common";
import { ILoggerService } from "@shared/interfaces/logger.interface";
import winston from "winston";
import { ConfigType } from "@nestjs/config";
import { LoggerModuleConfig } from "@config";
import rTracer from "cls-rtracer";

@Injectable()
export class LoggerService implements ILoggerService {
    private readonly _logger: winston.Logger;

    constructor(
        @Inject(LoggerModuleConfig.KEY)
        _config: ConfigType<typeof LoggerModuleConfig>
    ) {
        this._logger = winston.createLogger(_config);
    }

    info(message: string, meta?: Record<string, any>) {
        if (!meta) meta = {};
        const requestId = rTracer.id();
        if (requestId) meta.requestId = requestId;
        this._logger.info(message, { meta });
    }

    error(message: string, meta?: Record<string, any>) {
        if (!meta) meta = {};
        const requestId = rTracer.id();
        if (requestId) meta.requestId = requestId;
        this._logger.error(message, { meta });
    }

    log(level: string, message: string, meta?: Record<string, any>) {
        if (!meta) meta = {};
        const requestId = rTracer.id();
        if (requestId) meta.requestId = requestId;
        this._logger.log(level, message, { meta });
    }

    warn(message: string, meta?: Record<string, any>) {
        if (!meta) meta = {};
        const requestId = rTracer.id();
        if (requestId) meta.requestId = requestId;
        this._logger.warn(message, { meta });
    }

    debug(message: string, meta?: Record<string, any>) {
        if (!meta) meta = {};
        const requestId = rTracer.id();
        if (requestId) meta.requestId = requestId;
        this._logger.debug(message, { meta });
    }

    errorStream = {
        write: (message: string): void => {
            this.error(message);
        },
    };
}

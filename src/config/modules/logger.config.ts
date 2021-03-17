import { registerAs } from "@nestjs/config";
import { format, transports, LoggerOptions } from "winston";

const { splat, json, timestamp, align, printf } = format;

const consoleFormat = printf(info => {
    return JSON.stringify({
        timestamp: info.timestamp,
        level: info.level,
        message: info.message ? info.message : undefined,
        meta: info.meta,
    });
});

export default registerAs(
    "logger",
    (): LoggerOptions => ({
        format: format.combine(
            json(),
            timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            align(),
            splat(),
            consoleFormat
        ),
        transports: [
            new transports.Console({
                level: "debug",
                handleExceptions: true,
            }),
        ],
        exitOnError: false,
    })
);

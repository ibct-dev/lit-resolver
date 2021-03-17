import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { APP_INTERCEPTOR, APP_FILTER } from "@nestjs/core";
import { LoggerModule } from "@shared/modules/logger/logger.module";
import { LoggingInterceptor } from "@common/interceptors/logging.interceptor";
import { HttpExceptionFilter } from "@common/filters/http-exception.filter";
import { IdentifierModule } from "@identifier/identifier.module";

@Module({
    imports: [CqrsModule, LoggerModule, IdentifierModule],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
        },
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
    ],
})
export class AppModule {}

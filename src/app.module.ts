import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { APP_INTERCEPTOR, APP_FILTER, APP_PIPE } from "@nestjs/core";
import { LoggerModule } from "@shared/modules/logger/logger.module";
import { LoggingInterceptor } from "@common/interceptors/logging.interceptor";
import { HttpExceptionFilter } from "@common/filters/http-exception.filter";
import { ValidationPipe } from "@common/pipes/validation.pipe";
import { IdentifierModule } from "@identifier/identifier.module";
// import { LitChainModule } from "@lit-chain/lit-chain.module";

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
        {
            provide: APP_PIPE,
            useClass: ValidationPipe,
        },
    ],
})
export class AppModule {}

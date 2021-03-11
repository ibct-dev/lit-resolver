import "cross-fetch/polyfill";
import { NestFactory } from "@nestjs/core";
import {
    ExpressAdapter,
    NestExpressApplication,
} from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { LoggerModule } from "@shared/modules/logger/logger.module";
import { LoggerService } from "@shared/modules/logger/logger.service";
import { setupSwagger } from "@shared/setups/swagger/swagger.setup";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { appConfig } from "@config";
import rTracer from "cls-rtracer";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(
        AppModule,
        new ExpressAdapter(),
        { cors: true }
    );
    const loggerService = app.select(LoggerModule).get(LoggerService);

    try {
        app.setGlobalPrefix(appConfig.apiVersion);
        app.use(rTracer.expressMiddleware());

        // added security
        app.use(helmet()); // 4 버전의 경우 무한 로딩 이슈가 발생함, 3 버전으로 사용

        // rateLimit
        app.use(
            rateLimit({
                // TODO: 각 IP에 대해서 LIMIT가 걸리는지 확인하기
                windowMs: 1000 * 60 * 60, // an hour
                max: appConfig.rateLimitMax, // limit each IP to 100 requests per windowMs
                message:
                    "⚠️  Too many request created from this IP, please try again after an hour",
            })
        );

        app.use(
            morgan("combined", {
                skip(req, res) {
                    return res.statusCode < 400;
                },
                stream: loggerService.errorStream,
            })
        );

        setupSwagger(app);

        await app.listen(appConfig.port, () => {
            !appConfig.isProduction
                ? loggerService.info(
                      `🚀  Server ready at http://${appConfig.host}:${appConfig.port}/${appConfig.apiVersion}`,
                      { context: "BootStrap" }
                  )
                : loggerService.info(
                      `🚀  Server is listening on port ${appConfig.port}`,
                      { context: "BootStrap" }
                  );

            !appConfig.isProduction &&
                loggerService.info(
                    `🚀  Subscriptions ready at ws://${appConfig.host}:${appConfig.port}/${appConfig.apiVersion}`,
                    { context: "BootStrap" }
                );
        });
    } catch (error) {
        loggerService.error(`❌  Error starting server, ${error}`, {
            context: "BootStrap",
        });
        process.exit();
    }
}
bootstrap();

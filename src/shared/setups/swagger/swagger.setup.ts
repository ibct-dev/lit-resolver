import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { appConfig, swaggerConfig } from "@config";

export function setupSwagger(app: INestApplication) {
    const options = new DocumentBuilder()
        .setTitle(swaggerConfig.title)
        .setDescription(swaggerConfig.description)
        .setVersion(appConfig.apiVersion)
        .addBearerAuth(
            { type: "http", scheme: "bearer", bearerFormat: "JWT" },
            "access-token"
        )
        .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup(swaggerConfig.path, app, document);
}

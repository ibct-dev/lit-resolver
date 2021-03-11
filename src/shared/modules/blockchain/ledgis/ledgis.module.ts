import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LedgisService } from "./ledgis.service";
import { LedgisModuleConfig } from "@config";

@Module({
    imports: [ConfigModule.forFeature(LedgisModuleConfig)],
    providers: [
        {
            provide: "LedgisService",
            useClass: LedgisService,
        },
    ],
    exports: ["LedgisService"],
})
export class LedgisModule {}

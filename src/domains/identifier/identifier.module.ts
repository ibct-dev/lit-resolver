// identifier 모듈은 did를 이용하여 did document를 불러오는 역할을 함
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

import { LoggerModule } from "@shared/modules/logger/logger.module";
import { LedgisModule } from "@shared/modules/blockchain/ledgis/ledgis.module";

import { IdentifierController } from "@identifier/app/identifier.controller";
import { IdentifierService } from "@identifier/app/identifier.service";

// import { CommandHandlers } from "@identifier/domain-model/commands/handlers";
import { QueryHandlers } from "@identifier/domain/queries/handlers";
// import { EventHandlers } from "@identifier/domain-model/events/handlers";

@Module({
    imports: [CqrsModule, LedgisModule, LoggerModule],
    providers: [
        { provide: "IdentifierService", useClass: IdentifierService },
        // ...CommandHandlers,
        ...QueryHandlers,
        // ...EventHandlers,
    ],
    controllers: [IdentifierController],
})
export class IdentifierModule {}

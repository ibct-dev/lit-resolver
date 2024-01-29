import { Controller, Inject, Get, Header, Param } from "@nestjs/common";
import { IDidDocument } from "@shared/interfaces/did";
import { DidValidationPipe } from "@common/pipes/did-validation.pipe";
import { IIdentifierService } from "@identifier/domain/interfaces/identifier.interface";

@Controller()
export class IdentifierControllerRoot {
    constructor(
        @Inject("IdentifierService")
        private readonly _IdentifierService: IIdentifierService
    ) {}

    @Get("")
    async handleRootRequest(): Promise<any> {
        // Add your logic here to handle requests to the root path
        return "HealthCheck.";
    }
}

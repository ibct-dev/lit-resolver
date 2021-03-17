import { Controller, Inject, Get, Header, Param } from "@nestjs/common";
import { IDidDocument } from "@shared/interfaces/did";
import { DidValidationPipe } from "@common/pipes/did-validation.pipe";
import { IIdentifierService } from "@identifier/domain/interfaces/identifier.interface";

@Controller("identifiers")
export class IdentifierController {
    constructor(
        @Inject("IdentifierService")
        private readonly _IdentifierService: IIdentifierService
    ) {}

    @Get(":identifier")
    @Header("content-type", "application/did+ld+json")
    async findOneDidDocument(
        @Param("identifier", DidValidationPipe) did: string
    ): Promise<IDidDocument> {
        return await this._IdentifierService.getDidDocument(did);
    }
}

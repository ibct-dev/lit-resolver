import {
    Controller,
    Inject,
    HttpStatus,
    Get,
    Header,
    Param,
} from "@nestjs/common";
import { ApiTags, ApiResponse, ApiOperation } from "@nestjs/swagger";
import { IDidDocument } from "@shared/interfaces/did";
import { DidValidationPipe } from "@common/pipes/did-validation.pipe";
import { IIdentifierService } from "@identifier/domain/interfaces/identifier.interface";

@Controller("identifiers")
@ApiTags("Identifier")
export class IdentifierController {
    constructor(
        @Inject("IdentifierService")
        private readonly _IdentifierService: IIdentifierService
    ) {}

    @ApiOperation({ summary: "Get did document" })
    @ApiResponse({ status: HttpStatus.OK, description: "Get did document" })
    @Get(":identifier")
    @Header("content-type", "application/did+ld+json")
    async findOneDidDocument(
        @Param("identifier", DidValidationPipe) did: string
    ): Promise<IDidDocument> {
        return await this._IdentifierService.getDidDocument(did);
    }
}

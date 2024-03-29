import { Controller, Inject, Get, Header, Param, Res } from "@nestjs/common";
import { Response } from "express";
import { IDidDocument } from "@shared/interfaces/did";
import { DidValidationPipe } from "@common/pipes/did-validation.pipe";
import { IIdentifierService } from "@identifier/domain/interfaces/identifier.interface";
import { appConfig } from "@config";

@Controller(appConfig.apiVersion + "/identifiers")
export class IdentifierController {
    constructor(
        @Inject("IdentifierService")
        private readonly _IdentifierService: IIdentifierService
    ) {}

    @Get(":identifier")
    @Header("content-type", "application/did+ld+json")
    async findOneDidDocument(
        @Param("identifier", DidValidationPipe) did: string,
        @Res() res: Response
    ): Promise<IDidDocument> {
        if (!did) {
            res.status(200).send(); // 파라미터가 없는 경우 OK 응답
            return;
        }
        return await this._IdentifierService.getDidDocument(did);
    }
}

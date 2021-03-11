import { Injectable } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";

import { GetDidDocumentQuery } from "@identifier/domain/queries/impl/get-did-document.query";

import { IIdentifierService } from "@identifier/domain/interfaces/identifier.interface";

import { IDidDocument } from "@shared/interfaces/did";

@Injectable()
export class IdentifierService implements IIdentifierService {
    constructor(
        private readonly _commandBus: CommandBus,
        private readonly _queryBus: QueryBus
    ) {}

    public async getDidDocument(did: string): Promise<IDidDocument> {
        return await this._queryBus.execute(new GetDidDocumentQuery(did));
    }
}

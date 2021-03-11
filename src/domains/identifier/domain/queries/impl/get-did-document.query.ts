import { IQuery } from "@nestjs/cqrs";

export class GetDidDocumentQuery implements IQuery {
    constructor(public readonly _did: string) {}
}

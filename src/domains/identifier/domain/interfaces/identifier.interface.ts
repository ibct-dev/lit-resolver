import { IDidDocument } from "@shared/interfaces/did";

export interface IIdentifierService {
    getDidDocument(did: string): Promise<IDidDocument>;
}

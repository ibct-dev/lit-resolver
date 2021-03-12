import { IRawDid, IRawVcStatus } from "@shared/interfaces/did";

export interface ILedgisService {
    getRawDid(did: string): Promise<IRawDid>;
    getRawVcStatus(issuer: string, id: string): Promise<IRawVcStatus>;
}

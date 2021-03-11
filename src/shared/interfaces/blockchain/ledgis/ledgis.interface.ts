import { IAuthData } from "@shared/interfaces/ledgis";
import { IRawDid, IRawVcStatus } from "@shared/interfaces/did";

export interface ILedgisService {
    getRawDid(did: string): Promise<IRawDid>;
    getRawVcStatus(issuer: string, id: string): Promise<IRawVcStatus>;
    createAccount(
        creator: string,
        permission: string,
        accountName: string,
        ownerPublicKeys: string[],
        activePublicKeys: string[]
    ): Promise<{ transactionId: string; accountName: string }>;
    updateAuth(
        account: string,
        permission: string,
        targetPermission: string,
        authData: IAuthData
    ): Promise<{ transactionId: string; accountName: string }>;
    linkAuth(
        account: string,
        permission: string,
        targetPermission: string,
        code: string,
        actions: string[]
    ): Promise<{ transactionId: string; accountName: string }>;
}

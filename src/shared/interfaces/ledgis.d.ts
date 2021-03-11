export interface IAuthorization {
    actor: string;
    permission: string;
}

export interface IAction {
    account: string;
    name: string;
    authorization: IAuthorization[];
}

export interface IAuthKey {
    key: string;
    weight: number;
}

export interface IAuthAccount {
    permission: {
        actor: string;
        permission: string;
    };
    weight: number;
}

export interface IAuthData {
    threshold: number;
    keys: IAuthKey[];
    accounts: IAuthAccount[];
    waits: [];
}

export interface IUpdateAuthAction extends IAction {
    data: {
        account: string;
        permission: string;
        parent: string;
        auth: IAuthData;
    };
}

export interface ILinkAuthAction extends IAction {
    data: {
        account: string;
        code: string;
        type: string;
        requirement: string;
    };
}

export interface IGetActionTraceInput {
    code?: string;
    action?: string;
    receiver?: string;
    offset?: number;
    limit?: number;
}

export interface IActionInfo {
    blockNum: number;
    timestamp: string;
    transactionId: string;
    code: string;
    action: string;
    dataHex: string;
    permission: string;
}

export interface IHolderInfo {
    accountName: string;
    liquidBalance: number;
    stakedBalance: number;
    isFrozen: boolean;
}

export interface IHolderHistory {
    numberOfAccounts: number;
    totalBalance: number;
    totalLiquidBalance: number;
    totalUnlockBalanceWithoutIbctAccount: number;
    unlockAccountInfos: IHolderInfo[];
    lockAccountInfos: IHolderInfo[];
    ibctAndSystemAccountInfos: IHolderInfo[];
    accountInfos: IHolderInfo[];
}

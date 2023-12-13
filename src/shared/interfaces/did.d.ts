export interface IDidDocument {
    "@context": string[];
    id: string;
    uuid?: string;
    rawcontroller?: string;
    controller: string;
    service: Array<any>;
    authentication: Array<any>;
    assertionMethod: Array<any>;
    keyAgreement: Array<any>;
    capabilityInvocation: Array<any>;
    capabilityDelegation: Array<any>;
    verificationMethod: Array<any>;
    createdAt: string;
    updatedAt: string;
}

export interface IVerificationMethodIdx {
    id: string;
    type: string;
    controller: string;
    publicKeyBase58: string;
}

export interface IService {
    id: string;
    type: string;
    endpoint: string;
}

export interface IVerificationMethod {
    publicKey: string;
    controller: string;
}
export interface IVerificationMethod2 extends IVerificationMethod {
    keyType: string;
    index: number;
}

export interface IKeyId {
    uuid: string;
    index: number;
}

export interface IRawDid {
    uuid: string;
    controller: string;
    service: IService[];
    verificationMethod: IVerificationMethod[];
    verificationMethod2?: IVerificationMethod2[];
    authentication: IKeyId[];
    assertionMethod: IKeyId[];
    keyAgreement: IKeyId[];
    capabilityInvocation: IKeyId[];
    capabilityDelegation: IKeyId[];
    createdAt?: number;
    updatedAt?: number;
}

export interface IRawVcStatus {
    uuid: string;
    vcStatus: string;
    expiredAt?: number;
    createdAt?: number;
    updatedAt?: number;
}

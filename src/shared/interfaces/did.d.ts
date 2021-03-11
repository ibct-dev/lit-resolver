export interface IDidDocument {
    "@context": string;
    did: string;
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

export interface ICurve {
    privateKeyHex: string;
    publicKeyHex: string;
    privateKeyBase58: string;
    publicKeyBase58: string;
    type: string;
}

export interface IEosKeyInfo {
    privateKey: string;
    publicKey: string;
    legacyPrivateKey: string;
    legacyPublicKey: string;
}

export interface IEthKeyInfo {
    privateKey: string;
    address: string;
}

export interface IDidPrivate {
    userId: string;
    entropy: string;
    secret: string;
    rootDid: string;
    rootDidIdStringHex: string;
    did: string;
    didIdStringHex: string;
    mnemonicPhrase: string;
    keys: Array<{
        id: string;
        privateKeyHex: string; // Ed25519 Seed로도 활용
        ellipticCurve: ICurve;
        // twistedEdwardsCurve: ICurve;
        eosKeyInfo: IEosKeyInfo;
        ethKeyInfo: IEthKeyInfo;
    }>;
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

export interface IKeyId {
    uuid: string;
    index: number;
}

export interface IRawDid {
    uuid: string;
    controller: string;
    service: IService[];
    verificationMethod: IVerificationMethod[];
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

export interface IRegDidActionInput {
    controller: string;
    uuid: string;
    service: IService[];
    verificationMethod: IVerificationMethod[];
    authentication: IKeyId[];
    assertionMethod: IKeyId[];
    keyAgreement: IKeyId[];
    capabilityInvocation: IKeyId[];
    capabilityDelegation: IKeyId[];
}

export interface IDeleteDidActionInput {
    controller: string;
    uuid: string;
}

export interface IChangeCtrlActionInput {
    from: string;
    to: string;
    uuid: string;
}

export interface IAddServiceActionInput {
    controller: string;
    uuid: string;
    service: IService;
}

export interface IRmServiceActionInput {
    controller: string;
    uuid: string;
    serviceId: string;
}

export interface IUpdateKeysActionInput {
    controller: string;
    uuid: string;
    verificationMethod: IVerificationMethod[];
}

export interface IAuthenticatorActionInput {
    controller: string;
    uuid: string;
    authenticator: IKeyId;
}

export interface IAsserterActionInput {
    controller: string;
    uuid: string;
    asserter: IKeyId;
}

export interface IKeyAgreementActionInput {
    controller: string;
    uuid: string;
    keyAgreement: IKeyId;
}

export interface IDelegatorActionInput {
    controller: string;
    uuid: string;
    capabilityDelegator: IKeyId;
}

export interface IInvocatorActionInput {
    uuid: string;
    delegator: IKeyId;
    signature: string;
    capabilityInvocator: IKeyId;
}

export interface IRegVcsActionInput {
    issuer: string;
    vcUuid: string;
    vcStatus: string;
    expiredAt?: number;
}

export interface IUpdateVcsActionInput {
    issuer: string;
    vcUuid: string;
    vcStatus?: string;
    expiredAt?: number;
}

export interface IRmVcsActionInput {
    issuer: string;
    vcUuid: string;
}

export interface IClearVcsActionInput {
    issuer: string;
}

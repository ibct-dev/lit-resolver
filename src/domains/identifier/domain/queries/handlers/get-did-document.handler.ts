import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import {
    IDidDocument,
    IKeyId,
    IVerificationMethodIdx,
} from "@shared/interfaces/did";
import { LedgisService } from "@shared/modules/blockchain/ledgis/ledgis.service";
import { GetDidDocumentQuery } from "../impl/get-did-document.query";
import { BadRequestException } from "@common/errors/http.error";
import { BnToBase58 } from "@shared/libs/encode";
import bs58 from "bs58";
import { unix } from "dayjs";
import { PublicKey } from "eosjs/dist/eosjs-jssig";

@QueryHandler(GetDidDocumentQuery)
export class GetDidDocumentHandler
    implements IQueryHandler<GetDidDocumentQuery> {
    constructor(private readonly _ledgisService: LedgisService) {}

    private keyId2Str(keyId: IKeyId) {
        return `did:lit:${BnToBase58(keyId.uuid)}#${keyId.index}`;
    }

    async execute(query: GetDidDocumentQuery): Promise<IDidDocument> {
        const did = query._did;

        const rawDid = await this._ledgisService.getRawDid(did);

        if (!rawDid) {
            throw new BadRequestException(`Can not found did document`, {
                context: "GetDidDocumentQuery",
            });
        }

        console.log("rawDid :::: ", rawDid);

        const verificationMethod: IVerificationMethodIdx[] = rawDid.verificationMethod.map(
            (p, idx) => {
                if (idx == 0 || idx == 1) {
                    return {
                        id: `did:lit:${BnToBase58(p.controller)}#${idx}`,
                        type: `EcdsaSecp256k1VerificationKey2019`,
                        controller: `did:lit:${BnToBase58(p.controller)}`,
                        publicKeyBase58: bs58.encode(
                            PublicKey.fromString(p.publicKey)
                                .toElliptic()
                                .getPublic(true, "array")
                        ),
                    };
                } else {
                    return {
                        id: `did:lit:${BnToBase58(p.controller)}#${idx}`,
                        type: `Bls12381G2Key2020`,
                        controller: `did:lit:${BnToBase58(p.controller)}`,
                        publicKeyBase58: p.publicKey,
                    };
                }
            }
        );

        const verificationMethod2 = rawDid.verificationMethod2.map(p => {
            return {
                id: `did:lit:${BnToBase58(p.controller)}#${p.index}`,
                type: `${p.keyType}`,
                controller: `did:lit:${BnToBase58(p.controller)}`,
                publicKeyBase58: p.publicKey,
            };
        });

        for (let i = 0; i < verificationMethod2.length; i++) {
            verificationMethod.push(verificationMethod2[i]);
        }

        const authentication = rawDid.authentication.map((keyId: IKeyId) =>
            this.keyId2Str({ ...keyId })
        );

        const assertionMethod = rawDid.assertionMethod.map((keyId: IKeyId) =>
            this.keyId2Str({ ...keyId })
        );

        const keyAgreement = rawDid.keyAgreement.map((keyId: IKeyId) =>
            this.keyId2Str({ ...keyId })
        );

        const capabilityInvocation = rawDid.capabilityInvocation.map(
            (keyId: IKeyId) => this.keyId2Str({ ...keyId })
        );

        const capabilityDelegation = rawDid.capabilityDelegation.map(
            (keyId: IKeyId) => this.keyId2Str({ ...keyId })
        );

        const createdAt = unix(rawDid.createdAt).format();
        const updatedAt = unix(rawDid.updatedAt).format();

        return {
            "@context": [
                `https://www.w3.org/ns/did/v1`,
                `https://w3id.org/security/suites/bls12381-2020/v1`,
            ],
            id: `did:lit:${did}`,
            controller: `did:lit:${BnToBase58(rawDid.controller)}`,
            service: rawDid.service,
            authentication,
            assertionMethod,
            keyAgreement,
            capabilityInvocation,
            capabilityDelegation,
            verificationMethod,
            createdAt,
            updatedAt,
        };
    }
}

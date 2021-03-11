import { Inject, Injectable } from "@nestjs/common";
import { ILedgisService } from "@shared/interfaces/blockchain/ledgis/ledgis.interface";
import { GraphQLClient } from "graphql-request";
import { print, DocumentNode } from "graphql";
import { Api, JsonRpc } from "eosjs";
import { JsSignatureProvider } from "eosjs/dist/eosjs-jssig";
import { Contract } from "eosjs/dist/eosjs-serialize";
import { LedgisModuleConfig } from "@config";
import { ConfigType } from "@nestjs/config";
import { IRawDid, IRawVcStatus } from "@shared/interfaces/did";
import { IAuthData } from "@shared/interfaces/ledgis";
import { BadRequestException } from "@common/errors/http.error";
import bs58 from "bs58";

@Injectable()
export class LedgisService implements ILedgisService {
    private readonly rpc: JsonRpc;
    private readonly api: Api;
    private readonly contracts: Map<string, Contract> = new Map<
        string,
        Contract
    >();
    private readonly hasura: GraphQLClient;

    constructor(
        @Inject(LedgisModuleConfig.KEY)
        private readonly _config: ConfigType<typeof LedgisModuleConfig>
    ) {
        this.hasura = new GraphQLClient(this._config.hasuraEndpoint, {
            headers: { "x-hasura-role": "anonymous" },
        });

        const signatureProvider: JsSignatureProvider = new JsSignatureProvider(
            this._config.privateKeys
        );

        this.rpc = new JsonRpc(this._config.nodeEndpoint);
        this.api = new Api({
            rpc: this.rpc,
            signatureProvider,
            textDecoder: new TextDecoder(),
            textEncoder: new TextEncoder(),
        });
        this.init().catch(() => {});
    }

    private async init() {
        this.contracts.set(
            "led.identifier",
            await this.api.getContract("led.identifier", true)
        );
    }

    /*
     *   T1: Query Response
     *   T2: Query Variables
     */
    private async req<T1, T2>(args: {
        query: DocumentNode;
        variables?: T2;
    }): Promise<T1> {
        return await this.hasura.request<T1>(print(args.query), args.variables);
    }

    public async getRawDid(did: string): Promise<IRawDid> {
        try {
            const secondaryIndex = BigInt(
                `0x${bs58.decode(did).toString("hex")}`
            ).toString();
            return (
                await this.rpc.get_table_rows({
                    json: true,
                    code: this._config.code,
                    scope: this._config.code,
                    table: "did",
                    lower_bound: secondaryIndex,
                    upper_bound: secondaryIndex,
                    index_position: 2,
                    key_type: "i128",
                })
            ).rows[0];
        } catch (error) {
            throw new BadRequestException(
                `Get identifier contract's raw did error.`,
                {
                    context: "LedgisService",
                }
            );
        }
    }

    public async getRawVcStatus(
        issuer: string,
        id: string
    ): Promise<IRawVcStatus> {
        try {
            return (
                await this.rpc.get_table_rows({
                    json: true,
                    code: this._config.code,
                    scope: issuer,
                    table: "vcstatus",
                    lower_bound: BigInt(
                        `0x${bs58.decode(id).toString("hex")}`
                    ).toString(),
                    upper_bound: BigInt(
                        `0x${bs58.decode(id).toString("hex")}`
                    ).toString(),
                    index_position: 2,
                    key_type: "i128",
                })
            ).rows[0];
        } catch (error) {
            throw new BadRequestException(
                `Get identifier contract's raw vc status error.`,
                {
                    context: "LedgisService",
                }
            );
        }
    }

    public async createAccount(
        creator: string,
        permission: string,
        accountName: string,
        ownerPublicKeys: string[],
        activePublicKeys: string[]
    ): Promise<{ transactionId: string; accountName: string }> {
        ownerPublicKeys = ownerPublicKeys.sort();
        activePublicKeys = activePublicKeys.sort();

        try {
            const { transaction_id } = await this.api.transact(
                {
                    actions: [
                        {
                            account: "led",
                            name: "newaccount",
                            authorization: [
                                {
                                    actor: creator,
                                    permission,
                                },
                            ],
                            data: {
                                creator,
                                name: accountName,
                                owner: {
                                    threshold: ownerPublicKeys.length,
                                    keys: ownerPublicKeys.map(key => ({
                                        key,
                                        weight: 1,
                                    })),
                                    accounts: [],
                                    waits: [],
                                },
                                active: {
                                    threshold: activePublicKeys.length,
                                    keys: activePublicKeys.map(key => ({
                                        key,
                                        weight: 1,
                                    })),
                                    accounts: [],
                                    waits: [],
                                },
                            },
                        },
                    ],
                },
                {
                    blocksBehind: 3,
                    expireSeconds: 45,
                }
            );

            return { transactionId: transaction_id, accountName };
        } catch (error) {
            throw new BadRequestException(error.message, {
                context: `LedgisService`,
            });
        }
    }

    public async updateAuth(
        account: string,
        permission: string,
        targetPermission: string,
        authData: IAuthData
    ): Promise<{ transactionId: string; accountName: string }> {
        try {
            const { transaction_id } = await this.api.transact(
                {
                    actions: [
                        {
                            account: "led",
                            name: "updateauth",
                            authorization: [
                                {
                                    actor: account,
                                    permission,
                                },
                            ],
                            data: {
                                account,
                                permission: targetPermission,
                                parent: permission,
                                auth: authData,
                            },
                        },
                    ],
                },
                {
                    blocksBehind: 3,
                    expireSeconds: 45,
                }
            );

            return { transactionId: transaction_id, accountName: account };
        } catch (error) {
            throw new BadRequestException(error.message, {
                context: `LedgisService`,
            });
        }
    }

    public async linkAuth(
        account: string,
        permission: string,
        targetPermission: string,
        code: string,
        actions: string[]
    ): Promise<{ transactionId: string; accountName: string }> {
        try {
            const { transaction_id } = await this.api.transact(
                {
                    actions: actions.map(type => ({
                        account: "led",
                        name: "linkauth",
                        authorization: [
                            {
                                actor: account,
                                permission,
                            },
                        ],
                        data: {
                            account,
                            code,
                            type,
                            requirement: targetPermission,
                        },
                    })),
                },
                {
                    blocksBehind: 3,
                    expireSeconds: 45,
                }
            );

            return { transactionId: transaction_id, accountName: account };
        } catch (error) {
            throw new BadRequestException(error.message, {
                context: `LedgisService`,
            });
        }
    }
}

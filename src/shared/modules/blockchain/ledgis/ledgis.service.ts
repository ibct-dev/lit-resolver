import { Inject, Injectable } from "@nestjs/common";
import { ILedgisService } from "@shared/interfaces/blockchain/ledgis/ledgis.interface";
import { Api, JsonRpc } from "eosjs";
import { JsSignatureProvider } from "eosjs/dist/eosjs-jssig";
import { Contract } from "eosjs/dist/eosjs-serialize";
import { LedgisModuleConfig } from "@config";
import { ConfigType } from "@nestjs/config";
import { IRawDid, IRawVcStatus } from "@shared/interfaces/did";
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

    constructor(
        @Inject(LedgisModuleConfig.KEY)
        private readonly _config: ConfigType<typeof LedgisModuleConfig>
    ) {
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
            "led.lit",
            await this.api.getContract("led.lit", true)
        );
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
            throw new BadRequestException(`Get lit contract's raw did error.`, {
                context: "LedgisService",
            });
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
                `Get lit contract's raw vc status error.`,
                {
                    context: "LedgisService",
                }
            );
        }
    }
}

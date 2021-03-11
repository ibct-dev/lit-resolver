import bs58 from "bs58";
import BN from "bn.js";

export function hexToBase58(hex: string): string {
    return bs58.encode(new BN(hex, "hex").toBuffer());
}

export function BnToBase58(bn: string): string {
    return bs58.encode(new BN(bn).toBuffer());
}

export function BnToHex(bn: string): string {
    return new BN(bn).toBuffer().toString("hex");
}

export function Base58ToHex(base58: string): string {
    return new BN(bs58.decode(base58)).toString("hex");
}

export function Base58ToBn(base58: string): string {
    return new BN(bs58.decode(base58)).toString();
}

import BN from "bn.js";
import bs58 from "bs58";
import crypto from "crypto";
import elliptic from "elliptic";
import { PrivateKey } from "eosjs/dist/PrivateKey";

const HARDENED_KEY_OFFSET = 0x80000000;
const secp256k1 = new elliptic.ec("secp256k1");

export interface IHDWalletPath {
    purpose?: number;
    coinType?: number;
    account?: number;
    change?: number;
    addressIndex?: number;
}

export interface HDKeyConstructorOptions {
    chainCode: Buffer;
    privateKey?: Buffer | null;
    publicKey?: Buffer | null;
    index?: number;
    depth?: number;
    parentFingerprint?: Buffer;
    version?: VersionBytes;
}

export default class HDKey {
    private _version: VersionBytes;
    private _privateKey?: Buffer;
    private _publicKey!: Buffer;
    private _chainCode: Buffer;
    private _index: number;
    private _depth: number;
    private _parentFingerprint?: Buffer;
    private _keyIdentifier: Buffer;

    constructor({
        privateKey,
        publicKey,
        chainCode,
        index,
        depth,
        parentFingerprint,
        version,
    }: HDKeyConstructorOptions) {
        if (!privateKey && !publicKey) {
            throw new Error(
                "either private key or public key must be provided"
            );
        }
        if (privateKey) {
            this._privateKey = privateKey;
            const ecdh = crypto.createECDH("secp256k1");
            if ((ecdh as any).curve && (ecdh as any).curve.keyFromPrivate) {
                // ECDH is not native, fallback to pure-JS elliptic lib
                this._publicKey = Buffer.from(
                    secp256k1.keyFromPrivate(privateKey).getPublic(true, "hex"),
                    "hex"
                );
            } else {
                ecdh.setPrivateKey(privateKey);
                this._publicKey = Buffer.from(
                    ecdh.getPublicKey("hex", "compressed"),
                    "hex"
                );
            }
        } else if (publicKey) {
            this._publicKey = publicKey;
        }
        this._chainCode = chainCode;
        this._depth = depth || 0;
        this._index = index || 0;
        this._parentFingerprint = parentFingerprint;
        this._keyIdentifier = hash160(this._publicKey);
        this._version = version || versions.bitcoinMain;
    }

    static parseMasterSeed(seed: Buffer, version?: VersionBytes): HDKey {
        const i = hmacSha512("Bitcoin seed", seed);
        const iL = i.slice(0, 32);
        const iR = i.slice(32);
        return new HDKey({ privateKey: iL, chainCode: iR, version });
    }

    static parseExtendedKey(
        key: string,
        version: VersionBytes = versions.bitcoinMain
    ): HDKey {
        // version_bytes[4] || depth[1] || parent_fingerprint[4] || index[4] || chain_code[32] || key_data[33] || checksum[4]
        const decoded = Buffer.from(bs58.decode(key));
        if (decoded.length > 112) {
            throw new Error("invalid extended key");
        }

        const checksum = decoded.slice(-4);
        const buf = decoded.slice(0, -4);
        if (!sha256(sha256(buf)).slice(0, 4).equals(checksum)) {
            throw new Error("invalid checksum");
        }

        let o = 0;
        const versionRead = buf.readUInt32BE(o);
        o += 4;
        const depth = buf.readUInt8(o);
        o += 1;
        let parentFingerprint: Buffer | undefined = buf.slice(o, (o += 4));
        if (parentFingerprint.readUInt32BE(0) === 0) {
            parentFingerprint = undefined;
        }
        const index = buf.readUInt32BE(o);
        o += 4;
        const chainCode = buf.slice(o, (o += 32));
        const keyData = buf.slice(o);
        const privateKey = keyData[0] === 0 ? keyData.slice(1) : undefined;
        const publicKey = keyData[0] !== 0 ? keyData : undefined;

        if (
            (privateKey && versionRead !== version.bip32.private) ||
            (publicKey && versionRead !== version.bip32.public)
        ) {
            throw new Error("invalid version bytes");
        }

        return new HDKey({
            privateKey,
            publicKey,
            chainCode,
            index,
            depth,
            parentFingerprint,
            version,
        });
    }

    get privateKey(): Buffer | null {
        return this._privateKey || null;
    }

    get publicKey(): Buffer {
        return this._publicKey;
    }

    get chainCode(): Buffer {
        return this._chainCode;
    }

    get depth(): number {
        return this._depth;
    }

    get parentFingerprint(): Buffer | null {
        return this._parentFingerprint || null;
    }

    get index(): number {
        return this._index;
    }

    get keyIdentifier(): Buffer {
        return this._keyIdentifier;
    }

    get fingerprint(): Buffer {
        return this._keyIdentifier.slice(0, 4);
    }

    get version(): VersionBytes {
        return this._version;
    }

    get extendedPrivateKey(): string | null {
        return this._privateKey
            ? this.serialize(this._version.bip32.private, this._privateKey)
            : null;
    }

    get extendedPublicKey(): string {
        return this.serialize(this._version.bip32.public, this._publicKey);
    }

    derive(chain: string): HDKey {
        const c = chain.toLowerCase();

        let childKey: HDKey = this;
        c.split("/").forEach(path => {
            const p = path.trim();
            if (p === "m" || p === "m'" || p === "") {
                return;
            }
            const index = Number.parseInt(p, 10);
            if (Number.isNaN(index)) {
                throw new Error("invalid child key derivation chain");
            }
            const hardened = p.slice(-1) === "'";
            childKey = childKey.deriveChildKey(index, hardened);
        });

        return childKey;
    }

    private deriveChildKey(childIndex: number, hardened: boolean): HDKey {
        if (childIndex >= HARDENED_KEY_OFFSET) {
            throw new Error("invalid index");
        }
        if (!this.privateKey && !this.publicKey) {
            throw new Error(
                "either private key or public key must be provided"
            );
        }

        let index: number = childIndex;
        const data: Buffer = Buffer.alloc(37);
        let o = 0;
        if (hardened) {
            if (!this.privateKey) {
                throw new Error(
                    "cannot derive a hardened child key from a public key"
                );
            }
            // 0x00 || ser256(kpar) || ser32(i)
            // 0x00[1] || parent_private_key[32] || child_index[4]
            index += HARDENED_KEY_OFFSET;
            o += 1;
            o += this.privateKey.copy(data, o);
        } else {
            // serP(point(kpar)) || ser32(i)
            // compressed_parent_public_key[33] || child_index[4]
            o += this.publicKey.copy(data, o);
        }
        data.writeUInt32BE(index, o);
        // o += data.writeUInt32BE(index, o);

        const i = hmacSha512(this.chainCode, data);
        const iL = new BN(i.slice(0, 32));
        const iR = i.slice(32);

        // if parse256(IL) >= n, the resulting key is invalid; proceed with the next value for i
        if (!secp256k1.n) throw new Error();

        if (iL.cmp(secp256k1.n) >= 0) {
            return this.deriveChildKey(childIndex + 1, hardened);
        }

        if (this.privateKey) {
            // ki is parse256(IL) + kpar (mod n)
            const childKey = iL.add(new BN(this.privateKey)).mod(secp256k1.n);

            // if ki = 0, the resulting key is invalid; proceed with the next value for i
            if (childKey.cmp(new BN(0)) === 0) {
                return this.deriveChildKey(childIndex + 1, hardened);
            }

            return new HDKey({
                depth: this.depth + 1,
                privateKey: childKey.toArrayLike(Buffer, "be", 32),
                chainCode: iR,
                parentFingerprint: this.fingerprint,
                index,
                version: this.version,
            });
        }
        // Ki is point(parse256(IL)) + Kpar = G * IL + Kpar
        const parentKey = secp256k1.keyFromPublic(this.publicKey).getPublic();
        const childKey = secp256k1.g.mul(iL).add(parentKey);

        // if Ki is the point at infinity, the resulting key is invalid; proceed with the next value for i
        if (childKey.isInfinity()) {
            return this.deriveChildKey(childIndex + 1, false);
        }
        const compressedChildKey = Buffer.from(childKey.encode(null, true));

        return new HDKey({
            depth: this.depth + 1,
            publicKey: compressedChildKey,
            chainCode: iR,
            parentFingerprint: this.fingerprint,
            index,
            version: this.version,
        });
    }

    private serialize(version: number, key: Buffer): string {
        // version_bytes[4] || depth[1] || parent_fingerprint[4] || index[4] || chain_code[32] || key_data[33] || checksum[4]
        const buf = Buffer.alloc(78);
        let o: number = buf.writeUInt32BE(version, 0);
        o = buf.writeUInt8(this.depth, o);
        o += this.parentFingerprint ? this.parentFingerprint.copy(buf, o) : 4;
        o = buf.writeUInt32BE(this.index, o);
        o += this.chainCode.copy(buf, o);
        o += 33 - key.length;
        key.copy(buf, o);
        const checksum = sha256(sha256(buf)).slice(0, 4);
        return bs58.encode(Buffer.concat([buf, checksum]));
    }
}

export const hmacSha512 = (key: Buffer | string, data: Buffer): Buffer => {
    return crypto.createHmac("sha512", key).update(data).digest();
};

export const sha256 = (data: Buffer): Buffer => {
    return crypto.createHash("sha256").update(data).digest();
};

export const hash160 = (data: Buffer): Buffer => {
    const d = crypto.createHash("sha256").update(data).digest();
    return crypto.createHash("rmd160").update(d).digest();
};

export const accountPath = (args: IHDWalletPath): string => {
    const purpose = args.purpose || 44;
    const coinType = args.coinType || 60;
    const account = args.account || 0;
    return `m/${purpose}'/${coinType}'/${account}'`;
};

export const basicPath = (args: IHDWalletPath): string => {
    const purpose = args.purpose || 44;
    const coinType = args.coinType || 60;
    const account = args.account || 0;
    const change = args.change || 0;
    return `${accountPath({ purpose, coinType, account })}/${change}`;
};

// account => -2147483648 ~ 2147483647 (2^32)
// addressIndex => 0 ~ 2147483647 (2^31)
// 00000000 00000000 00000000 00000000 ~ 11111111 11111111 11111111 11111111
// 10000000 00000000 00000000 00000000 ~ 11111111 11111111 11111111 11111111
// '이 붙고 안붙고 2^32, 2^31 차이가 있음
export const walletPath = (args: IHDWalletPath): string => {
    const purpose = args.purpose || 44;
    const coinType = args.coinType || 60;
    const account = args.account || 0;
    const change = args.change || 0;
    const addressIndex = args.addressIndex || 0;
    return `${basicPath({
        purpose,
        coinType,
        account,
        change,
    })}/${addressIndex}`;
};

export const getEosPrivateKey = (data: Buffer | string): PrivateKey => {
    return PrivateKey.fromElliptic(secp256k1.keyFromPrivate(data), 0);
};

// uuid v4 기반으로 생성된 did idString을 Big endian으로 32bits 씩 잘라서 path의 트리로 사용, 마지막은 2^31의 인덱스 값
// idx => 0 ~ 2147483647
export const didPath = (idStringHex: string, idx = 0): string => {
    if (!idStringHex.match(/^[0-9a-f]{32}$/g)) {
        throw new Error("Invalid did id string");
    }
    const tokens = idStringHex.match(/.{1,8}/gi) ?? [];
    const signedInt32Array = new Int32Array(tokens.map(t => parseInt(t, 16)));
    return `m/13915'/${signedInt32Array[0]}'/${signedInt32Array[1]}'/${signedInt32Array[2]}'/${signedInt32Array[3]}'/${idx}`;
};

// export const ethPrivateKey = (hdKey: HDKey): string => {
//     const privateKey = hdKey.privateKey;
//     if (privateKey) return privateKey.toString("hex");
//     throw new Error(`hdkey에 private key가 존재하지 않습니다.`);
// };

// export const ethPrivateToPublic = (ethPrivateKey: string): string => {
//     return privateToPublic(Buffer.from(ethPrivateKey, "hex")).toString("hex");
// };

// export const ethPrivateToAddress = (ethPrivateKey: string): string => {
//     return privateToAddress(Buffer.from(ethPrivateKey, "hex")).toString("hex");
// };

// export const ethPrivateToEosPrivate = (ethPrivateKey: string): string => {
//     return ecc.PrivateKey(Buffer.from(ethPrivateKey, "hex")).toWif();
// };

// export const eosPrivateToPublic = (eosPrivateKey: string): string => {
//     return ecc.privateToPublic(eosPrivateKey);
// };

export interface VersionBytes {
    bip32: {
        public: number;
        private: number;
    };
    public: number;
}

export const versions = {
    bitcoinMain: {
        bip32: {
            public: 0x0488b21e,
            private: 0x0488ade4,
        },
        public: 0,
    },
    bitcoinTest: {
        bip32: {
            public: 0x043587cf,
            private: 0x04358394,
        },
        public: 0x6f,
    },
};

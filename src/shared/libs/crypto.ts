import crypto from "crypto";
import { secretbox, randomBytes } from "tweetnacl";
import { ec } from "elliptic";
import bs58 from "bs58";
// import { split, combine } from "shamirs-secret-sharing-ts";
// import { PrivateKey } from "eosjs/dist/PrivateKey";
// import KeyEncoder from "key-encoder";

export const eciesEncrypt = (
    msg: Uint8Array,
    privateKey: string,
    publicKey: string
): string => {
    const secp256k1 = new ec("secp256k1");
    const sk = secp256k1.keyFromPrivate(privateKey);
    const pk = secp256k1.keyFromPublic(publicKey);
    const ecdh = crypto.createECDH("secp256k1");

    ecdh.setPrivateKey(sk.getPrivate("hex"), "hex");
    const symmetricKey = ecdh.computeSecret(pk.getPublic(true, "hex"), "hex");

    const nonce = randomBytes(24);

    return bs58.encode(
        Buffer.concat([nonce, secretbox(msg, nonce, symmetricKey)])
    );
};

export const eciesDecrypt = (
    encryptedData: string,
    privateKey: string,
    publicKey: string
): Uint8Array => {
    const secp256k1 = new ec("secp256k1");
    const sk = secp256k1.keyFromPrivate(privateKey);
    const pk = secp256k1.keyFromPublic(publicKey);
    const ecdh = crypto.createECDH("secp256k1");

    const encryptedDataBuf = bs58.decode(encryptedData);

    ecdh.setPrivateKey(sk.getPrivate("hex"), "hex");
    const symmetricKey = ecdh.computeSecret(pk.getPublic(true, "hex"), "hex");

    const nonce = encryptedDataBuf.slice(0, 24);

    return Buffer.from(
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        secretbox.open(encryptedDataBuf.slice(24), nonce, symmetricKey) || []
    );
};

export const genRandomBytesWithBase58 = (bytes: number): string => {
    return bs58.encode(crypto.randomBytes(bytes));
};

/**
 *
 * @algorithm scryptSync(password, salt, keylen, option)
 * @param password - 패스워드
 * @param salt - 암호학 솔트
 * @param keylen - digest 길이
 * @param option - ScryptOptions { N?: number; r?: number; p?: number; maxmem?: number; }
 * @param N - CPU 비용
 * @param r - 메모리 비용
 * @param p - 병렬화(parallelization)
 * @param maxmem -
 *
 */
export const scrypt512 = (
    data: string,
    _salt?: string
): { digest: string; salt: string } => {
    const salt = _salt ? bs58.decode(_salt) : crypto.randomBytes(64);
    const digest = crypto.scryptSync(data, salt, 64, { N: 1024, r: 8, p: 1 });
    return { digest: bs58.encode(digest), salt: bs58.encode(salt) };
};

export const scrypt256 = (
    data: string,
    _salt?: string
): { digest: string; salt: string } => {
    const salt = _salt ? bs58.decode(_salt) : crypto.randomBytes(32);
    const digest = crypto.scryptSync(data, salt, 32, { N: 1024, r: 8, p: 1 });
    return { digest: bs58.encode(digest), salt: bs58.encode(salt) };
    // return { digest: digest.toString("hex"), salt: salt.toString("hex") };
};

// export const verifyScrypt512 = (
//     digest: string,
//     data: string,
//     salt: string
// ): boolean => {
//     return (
//         digest ===
//         bs58.encode(
//             crypto.scryptSync(data, bs58.decode(salt), 64, {
//                 N: 1024,
//                 r: 8,
//                 p: 1,
//             })
//         )
//     );
// };

// export const verifyScrypt256 = (
//     digest: string,
//     data: string,
//     salt: string
// ): boolean => {
//     return (
//         digest ===
//         bs58.encode(
//             crypto.scryptSync(data, bs58.decode(salt), 32, {
//                 N: 1024,
//                 r: 8,
//                 p: 1,
//             })
//         )
//     );
// };

export const sha256 = (message: string): string => {
    return crypto.createHash("sha256").update(message).digest("hex");
};

// export const signHashWithECC = (data: string, privateKey: string): string => {
//     try {
//         return ecc.signHash(Buffer.from(data), privateKey);
//     } catch (error) {
//         throw new Error(error.message);
//     }
// };

// export const recoverHashWithECC = (signature: string, data: string): string => {
//     try {
//         return ecc.recoverHash(signature, Buffer.from(data));
//     } catch (error) {
//         throw new Error(error.message);
//     }
// };

// interface ISplitOption {
//     shares: number;
//     threshold: number;
// }

// export const splitKey = (key: string, option: ISplitOption): string[] => {
//     return split(key, option).map(val => {
//         return bs58.encode(val);
//     });
// };

// export const mergeKey = (splitKey: string[]): string => {
//     return combine(
//         splitKey.map(val => {
//             return bs58.decode(val);
//         })
//     ).toString();
// };

// export const getSortedPrivateKeys = (privateKeys: string[]): string[] => {
//     return privateKeys.sort((a, b) =>
//         PrivateKey.fromString(a)
//             .getPublicKey()
//             .toLegacyString() <
//         PrivateKey.fromString(b)
//             .getPublicKey()
//             .toLegacyString()
//             ? -1
//             : 1
//     );
// };

// export const genRsa256KeyPair = (passphrase?: string): any => {
//     if (!passphrase) passphrase = crypto.randomBytes(32).toString();
//     return crypto.generateKeyPairSync("rsa", {
//         modulusLength: 2048,
//         publicKeyEncoding: {
//             type: "spki",
//             format: "pem",
//         },
//         privateKeyEncoding: {
//             type: "pkcs8",
//             format: "pem",
//             cipher: "aes-256-cbc",
//             passphrase,
//         },
//     });
// };

// Pem으로 제공됨, 문자열로 치환할때 중간의 개행 부분이 space로 자동 변환 될 수 있음.
// 따라서 \n을 \\n으로 치환하여 저장필요 replace(/\n/g, "\\n").
// 사용시 \\n을 \n으로 치환 replace(/\\n/g, "\n").
// export const genEccKeyPair = (
//     entropy?: string | Buffer
// ): { privateKey: string; publicKey: string } => {
//     if (!entropy) entropy = crypto.randomBytes(24);

//     const secp256k1 = new ec("secp256k1");
//     const encoder = new KeyEncoder("secp256k1");

//     const keyPair = secp256k1.genKeyPair({ entropy });

//     const privateKey = encoder.encodePrivate(
//         keyPair.getPrivate("hex"),
//         "raw",
//         "pem"
//     );

//     const publicKey = encoder.encodePublic(
//         keyPair.getPublic("hex"),
//         "raw",
//         "pem"
//     );

//     return {
//         privateKey,
//         publicKey,
//     };
// };

// export const pem2str = (pem: string): string => {
//     return pem.replace(/\n/g, "\\n");
// };

// export const str2pem = (strPem: string): string => {
//     return strPem.replace(/\\n/g, "\n");
// };

// export const getRawEccPrivateKey = (privateKey: string): string => {
//     const encoder = new KeyEncoder("secp256k1");

//     return encoder.encodePrivate(privateKey, "pem", "raw");
// };

// export const getRawEccPublicKey = (publicKey: string): string => {
//     const encoder = new KeyEncoder("secp256k1");

//     return encoder.encodePublic(publicKey, "pem", "raw");
// };

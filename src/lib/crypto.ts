import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const ITERATIONS = 100_000;
const KEY_LEN = 32;
const DIGEST = "sha256";
const SALT = Buffer.from(process.env.ENCRYPTION_SALT ?? "rOaI3UPUp78ycY5Hq25l11d2CotB1uTjigKHqWW/EeY=");

function deriveKey(uid: string): Buffer {
    return pbkdf2Sync(uid, SALT, ITERATIONS, KEY_LEN, DIGEST);
}

export function encrypt(plaintext: string, uid: string): string {
    const key = deriveKey(uid);
    const iv = randomBytes(12);
    const cipher = createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return [iv, authTag, encrypted].map((b) => b.toString("base64")).join(":");
}

export function decrypt(ciphertext: string, uid: string): string {

    const [ivB64, authTagB64, encryptedB64] = ciphertext.split(":");
    if (!ivB64 || !authTagB64 || !encryptedB64) throw new Error("Formato ciphertext non valido");

    const key = deriveKey(uid);
    const iv = Buffer.from(ivB64, "base64");
    const authTag = Buffer.from(authTagB64, "base64");
    const encrypted = Buffer.from(encryptedB64, "base64");

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
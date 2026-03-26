/**
 * AES-128-ECB 加解密模块
 * AES-128-ECB encryption/decryption module
 *
 * 用于文件上传前的加密和下载后的解密
 * Used for encrypting files before upload and decrypting after download
 */

import { createCipheriv, createDecipheriv } from "node:crypto";

/**
 * 使用 AES-128-ECB 加密数据（PKCS7 填充，Node.js 默认）
 * Encrypt buffer with AES-128-ECB (PKCS7 padding is default in Node.js)
 *
 * @param plaintext - 明文数据 / Plaintext data
 * @param key - 16 字节 AES 密钥 / 16-byte AES key
 * @returns 加密后的密文 / Encrypted ciphertext
 */
export function encryptAesEcb(plaintext: Buffer, key: Buffer): Buffer {
  const cipher = createCipheriv("aes-128-ecb", key, null);
  return Buffer.concat([cipher.update(plaintext), cipher.final()]);
}

/**
 * 使用 AES-128-ECB 解密数据（PKCS7 填充）
 * Decrypt buffer with AES-128-ECB (PKCS7 padding)
 *
 * @param ciphertext - 密文数据 / Ciphertext data
 * @param key - 16 字节 AES 密钥 / 16-byte AES key
 * @returns 解密后的明文 / Decrypted plaintext
 */
export function decryptAesEcb(ciphertext: Buffer, key: Buffer): Buffer {
  const decipher = createDecipheriv("aes-128-ecb", key, null);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

/**
 * 计算 AES-128-ECB 加密后的密文大小（PKCS7 填充到 16 字节边界）
 * Compute AES-128-ECB ciphertext size (PKCS7 padding to 16-byte boundary)
 *
 * @param plaintextSize - 明文大小（字节）/ Plaintext size in bytes
 * @returns 加密后的密文大小（字节）/ Ciphertext size in bytes
 */
export function aesEcbPaddedSize(plaintextSize: number): number {
  return Math.ceil((plaintextSize + 1) / 16) * 16;
}

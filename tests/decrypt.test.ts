/**
 * AES-128-ECB 加解密模块测试
 * AES-128-ECB encryption/decryption module tests
 */

import { describe, it, expect } from 'vitest';
import { encryptAesEcb, decryptAesEcb, aesEcbPaddedSize } from '../src/decrtpt';
import crypto from 'node:crypto';

describe('AES-128-ECB 加解密 / AES-128-ECB Encryption/Decryption', () => {
  const key = crypto.randomBytes(16);

  // 测试加密后解密还原 / Test encrypt then decrypt restores original
  it('encrypt then decrypt should restore original data / 加密后解密应该还原原始数据', () => {
    const plaintext = Buffer.from('Hello, World!');
    const ciphertext = encryptAesEcb(plaintext, key);
    const decrypted = decryptAesEcb(ciphertext, key);
    expect(decrypted).toEqual(plaintext);
  });

  // 测试空数据加解密 / Test empty data encrypt/decrypt
  it('empty data encrypt then decrypt should restore / 空数据加密后解密应该还原', () => {
    const plaintext = Buffer.alloc(0);
    const ciphertext = encryptAesEcb(plaintext, key);
    const decrypted = decryptAesEcb(ciphertext, key);
    expect(decrypted).toEqual(plaintext);
  });

  // 测试大数据块加解密 / Test large data block encrypt/decrypt
  it('large data block encrypt then decrypt should restore / 大数据块加密后解密应该还原', () => {
    const plaintext = crypto.randomBytes(1024);
    const ciphertext = encryptAesEcb(plaintext, key);
    const decrypted = decryptAesEcb(ciphertext, key);
    expect(decrypted).toEqual(plaintext);
  });

  // 测试错误密钥解密失败 / Test wrong key decryption fails
  it('decryption with wrong key should fail / 不同密钥解密应该失败', () => {
    const plaintext = Buffer.from('secret data');
    const ciphertext = encryptAesEcb(plaintext, key);
    const wrongKey = crypto.randomBytes(16);
    expect(() => decryptAesEcb(ciphertext, wrongKey)).toThrow();
  });

  // 测试加密结果长度为 16 的倍数 / Test ciphertext length is multiple of 16
  it('ciphertext length should be multiple of 16 / 加密结果长度应该是 16 的倍数', () => {
    const plaintext = Buffer.from('test');
    const ciphertext = encryptAesEcb(plaintext, key);
    expect(ciphertext.length % 16).toBe(0);
  });
});

describe('aesEcbPaddedSize', () => {
  // 测试 0 字节填充 / Test 0 bytes padding
  it('0 bytes should pad to 16 bytes / 0 字节应该填充到 16 字节', () => {
    expect(aesEcbPaddedSize(0)).toBe(16);
  });

  // 测试 1 字节填充 / Test 1 byte padding
  it('1 byte should pad to 16 bytes / 1 字节应该填充到 16 字节', () => {
    expect(aesEcbPaddedSize(1)).toBe(16);
  });

  // 测试 15 字节填充 / Test 15 bytes padding
  it('15 bytes should pad to 16 bytes / 15 字节应该填充到 16 字节', () => {
    expect(aesEcbPaddedSize(15)).toBe(16);
  });

  // 测试 16 字节填充（PKCS7 需要额外块）/ Test 16 bytes padding (PKCS7 requires extra block)
  it('16 bytes should pad to 32 bytes (PKCS7 extra block) / 16 字节应该填充到 32 字节（PKCS7 需要额外块）', () => {
    expect(aesEcbPaddedSize(16)).toBe(32);
  });

  // 测试 17 字节填充 / Test 17 bytes padding
  it('17 bytes should pad to 32 bytes / 17 字节应该填充到 32 字节', () => {
    expect(aesEcbPaddedSize(17)).toBe(32);
  });

  // 测试 1024 字节填充 / Test 1024 bytes padding
  it('1024 bytes should pad to 1040 bytes / 1024 字节应该填充到 1040 字节', () => {
    expect(aesEcbPaddedSize(1024)).toBe(1040);
  });
});

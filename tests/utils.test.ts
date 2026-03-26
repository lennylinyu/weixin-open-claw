/**
 * 工具函数模块测试
 * Utility functions module tests
 */

import { describe, it, expect } from 'vitest';
import { delay, generateClientId, createMD5, createHeader } from '../src/utils/utils';

describe('delay', () => {
  // 测试返回 Promise / Test returns Promise
  it('should return a Promise / 应该返回 Promise', () => {
    const result = delay(0);
    expect(result).toBeInstanceOf(Promise);
  });

  // 测试在指定时间后 resolve / Test resolves after specified time
  it('should resolve after specified time / 应该在指定时间后 resolve', async () => {
    const start = Date.now();
    await delay(50);
    const elapsed = Date.now() - start;
    // 允许一些误差 / Allow some tolerance
    expect(elapsed).toBeGreaterThanOrEqual(40);
  });

  // 测试默认参数立即 resolve / Test default parameter resolves immediately
  it('default parameter should resolve immediately / 默认参数应该立即 resolve', async () => {
    const start = Date.now();
    await delay();
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(50);
  });
});

describe('generateClientId', () => {
  // 测试生成以 openclaw-weixin: 开头的 ID / Test generating ID prefixed with openclaw-weixin:
  it('should generate ID prefixed with openclaw-weixin: / 应该生成以 openclaw-weixin: 开头的 ID', () => {
    const id = generateClientId();
    expect(id.startsWith('openclaw-weixin:')).toBe(true);
  });

  // 测试每次生成不同的 ID / Test each generation produces different ID
  it('each generated ID should be unique / 每次生成的 ID 应该不同', () => {
    const id1 = generateClientId();
    const id2 = generateClientId();
    expect(id1).not.toBe(id2);
  });

  // 测试 ID 格式 / Test ID format
  it('ID format should contain timestamp and random hex / ID 格式应该包含时间戳和随机数', () => {
    const id = generateClientId();
    // 格式 / Format: openclaw-weixin:timestamp-randomhex
    const parts = id.split(':');
    expect(parts).toHaveLength(2);
    expect(parts[1]).toMatch(/^\d+-[0-9a-f]+$/);
  });
});

describe('createMD5', () => {
  // 测试计算字符串的 MD5 / Test computing MD5 of string
  it('should compute MD5 of string / 应该计算字符串的 MD5', () => {
    const hash = createMD5('hello');
    expect(hash).toBe('5d41402abc4b2a76b9719d911017c592');
  });

  // 测试计算 Buffer 的 MD5 / Test computing MD5 of Buffer
  it('should compute MD5 of Buffer / 应该计算 Buffer 的 MD5', () => {
    const hash = createMD5(Buffer.from('hello'));
    expect(hash).toBe('5d41402abc4b2a76b9719d911017c592');
  });

  // 测试空字符串的固定 MD5 / Test fixed MD5 of empty string
  it('empty string should have fixed MD5 / 空字符串应该有固定的 MD5', () => {
    const hash = createMD5('');
    expect(hash).toBe('d41d8cd98f00b204e9800998ecf8427e');
  });
});

describe('createHeader', () => {
  // 测试创建包含必要字段的请求头 / Test creating headers with required fields
  it('should create headers with required fields / 应该创建包含必要字段的请求头', () => {
    const header = createHeader('test-token');

    expect(header['Content-Type']).toBe('application/json');
    expect(header['AuthorizationType']).toBe('ilink_bot_token');
    expect(header['Authorization']).toBe('Bearer test-token');
    expect(header['X-WECHAT-UIN']).toBeDefined();
  });

  // 测试 Authorization 包含传入的 token / Test Authorization contains the provided token
  it('Authorization should contain the provided token / Authorization 应该包含传入的 token', () => {
    const header = createHeader('my-secret-token');
    expect(header['Authorization']).toBe('Bearer my-secret-token');
  });

  // 测试 X-WECHAT-UIN 是 base64 编码 / Test X-WECHAT-UIN is base64 encoded
  it('X-WECHAT-UIN should be base64 encoded / X-WECHAT-UIN 应该是 base64 编码', () => {
    const header = createHeader('token');
    // base64 字符集验证 / base64 charset validation
    expect(header['X-WECHAT-UIN']).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });
});

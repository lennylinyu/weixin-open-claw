/**
 * Client 客户端和 Config 配置模块测试
 * Client and Config module tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Client, setConfig } from '../src';
import {
  buildBaseInfo,
  getDefaultBaseUrl,
  getCdnUrl,
  getBotType,
  WEIXIN_DEFAULT_BASE_URL,
  WEIXIN_CDN_BASE_URL,
  WEIXIN_DEFAULT_ILINK_BOT_TYPE,
} from '../src/config';

describe('Client', () => {
  // 测试通过静态工厂方法创建实例 / Test creating instance via static factory method
  it('should create instance via static create method / 应该通过 create 静态方法正确创建实例', () => {
    const client = Client.create('user-id', 'bot-id', 'bot-token');
    expect(client).toBeInstanceOf(Client);
  });

  // 测试通过构造函数创建实例 / Test creating instance via constructor
  it('should create instance via constructor / 应该通过构造函数正确创建实例', () => {
    const client = new Client('user-id', 'bot-id', 'bot-token');
    expect(client).toBeInstanceOf(Client);
  });

  // 测试 apiBaseURL 默认值 / Test apiBaseURL default value
  it('apiBaseURL should have default value / apiBaseURL 应该有默认值', () => {
    const client = Client.create('user-id', 'bot-id', 'bot-token');
    expect(client.apiBaseURL).toBe(WEIXIN_DEFAULT_BASE_URL);
  });

  // 测试设置自定义 apiBaseURL / Test setting custom apiBaseURL
  it('should be able to set apiBaseURL / 应该能设置 apiBaseURL', () => {
    const client = Client.create('user-id', 'bot-id', 'bot-token');
    client.apiBaseURL = 'https://custom.example.com';
    expect(client.apiBaseURL).toBe('https://custom.example.com');
  });

  // 测试 stop 方法不抛异常 / Test stop method does not throw
  it('stop should not throw / stop 方法不应抛出异常', () => {
    const client = Client.create('user-id', 'bot-id', 'bot-token');
    expect(() => client.stop()).not.toThrow();
  });

  // 测试 reset 方法不抛异常 / Test reset method does not throw
  it('reset should not throw / reset 方法不应抛出异常', () => {
    const client = Client.create('user-id', 'bot-id', 'bot-token');
    expect(() => client.reset()).not.toThrow();
  });

  // 测试 login 返回 AsyncGenerator / Test login returns AsyncGenerator
  it('login should return AsyncGenerator / login 静态方法应该返回 AsyncGenerator', () => {
    const gen = Client.login();
    expect(gen).toBeDefined();
    expect(typeof gen[Symbol.asyncIterator]).toBe('function');
  });
});

describe('Config', () => {
  // 测试 buildBaseInfo 返回正确结构 / Test buildBaseInfo returns correct structure
  it('buildBaseInfo should return object with channel_version / buildBaseInfo 应该返回包含 channel_version 的对象', () => {
    const info = buildBaseInfo();
    expect(info).toHaveProperty('channel_version');
    expect(info.channel_version).toBe('1.0.3');
  });

  // 测试获取默认 API 基础 URL / Test getting default API base URL
  it('getDefaultBaseUrl should return default base URL / getDefaultBaseUrl 应该返回默认基础 URL', () => {
    expect(getDefaultBaseUrl()).toBe(WEIXIN_DEFAULT_BASE_URL);
  });

  // 测试获取默认 CDN URL / Test getting default CDN URL
  it('getCdnUrl should return default CDN URL / getCdnUrl 应该返回默认 CDN URL', () => {
    expect(getCdnUrl()).toBe(WEIXIN_CDN_BASE_URL);
  });

  // 测试获取默认 Bot 类型 / Test getting default bot type
  it('getBotType should return default bot type / getBotType 应该返回默认 Bot 类型', () => {
    expect(getBotType()).toBe(WEIXIN_DEFAULT_ILINK_BOT_TYPE);
  });

  // 测试 setConfig 修改配置 / Test setConfig modifies configuration
  it('setConfig should modify configuration / setConfig 应该能修改配置', () => {
    const customBase = 'https://custom.example.com';
    setConfig({ base: customBase });
    expect(getDefaultBaseUrl()).toBe(customBase);

    // 恢复默认值 / Restore default value
    setConfig({ base: WEIXIN_DEFAULT_BASE_URL });
  });
});

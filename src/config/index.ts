/**
 * 全局配置模块
 * Global configuration module
 *
 * 管理 SDK 的基础 URL、CDN 地址、Bot 类型等全局配置
 * Manages global SDK settings such as base URL, CDN address, and bot type
 */

import { BaseInfo } from "../types";

/**
 * 微信开放平台默认 API 基础 URL
 * Default API base URL for WeChat Open Platform
 */
export const WEIXIN_DEFAULT_BASE_URL = 'https://ilinkai.weixin.qq.com';

/**
 * 微信开放平台默认 CDN 基础 URL
 * Default CDN base URL for WeChat Open Platform
 */
export const WEIXIN_CDN_BASE_URL = 'https://novac2c.cdn.weixin.qq.com/c2c';

/**
 * 默认 iLink Bot 类型
 * Default iLink bot type
 */
export const WEIXIN_DEFAULT_ILINK_BOT_TYPE = '3';

/**
 * 会话过期错误码
 * Session expired error code
 */
export const SESSION_EXPIRED_ERRCODE = -14;

/**
 * 默认 API 请求超时时间（毫秒）
 * Default API request timeout in milliseconds
 */
export const DEFAULT_API_TIMEOUT_MS = 15_000;

/**
 * 全局配置对象
 * Global configuration object
 */
const config  = {
  /** API 基础地址 / API base URL */
  base : WEIXIN_DEFAULT_BASE_URL,
  /** CDN 基础地址 / CDN base URL */
  cdn : WEIXIN_CDN_BASE_URL,
  /** Bot 类型 / Bot type */
  botType : WEIXIN_DEFAULT_ILINK_BOT_TYPE,
}

/**
 * 构建基础请求信息
 * Build base request info
 *
 * @returns 包含 channel_version 的基础信息对象
 *          Base info object containing channel_version
 */
export function buildBaseInfo(): BaseInfo {
  return { channel_version: '1.0.3' };
}

/**
 * 获取当前 CDN 地址
 * Get current CDN URL
 *
 * @returns CDN 基础 URL / CDN base URL
 */
export function getCdnUrl() {
  return config.cdn ?? WEIXIN_CDN_BASE_URL
}

/**
 * 获取当前 Bot 类型
 * Get current bot type
 *
 * @returns Bot 类型字符串 / Bot type string
 */
export function getBotType() {
  return config.botType ?? WEIXIN_DEFAULT_ILINK_BOT_TYPE
}

/**
 * 获取当前默认 API 基础 URL
 * Get current default API base URL
 *
 * @returns API 基础 URL / API base URL
 */
export function getDefaultBaseUrl() {
  return config.base ?? WEIXIN_DEFAULT_BASE_URL
}

/**
 * 设置全局配置（合并更新）
 * Set global configuration (merge update)
 *
 * @param newConfig - 要更新的配置项 / Configuration items to update
 *
 * @example
 * ```typescript
 * setConfig({ base: 'https://custom-api.example.com' });
 * ```
 */
export function setConfig(newConfig: Partial<typeof config>) {
  Object.assign(config, newConfig);
}
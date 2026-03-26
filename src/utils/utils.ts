/**
 * 通用工具函数模块
 * General utility functions module
 *
 * 提供延迟、ID 生成、MD5 计算、请求头创建等通用功能
 * Provides delay, ID generation, MD5 hashing, header creation and other utilities
 */

import crypto from "node:crypto";
import { createReadStream } from "node:fs";

/**
 * 延迟指定毫秒数
 * Delay for specified milliseconds
 *
 * @param ms - 延迟时间（毫秒），默认为 0 / Delay time in ms, defaults to 0
 * @returns Promise，在指定时间后 resolve / Promise that resolves after the specified time
 */
export const delay = (ms = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 生成带前缀的唯一 ID（格式：prefix:timestamp-randomhex）
 * Generate a unique ID with prefix (format: prefix:timestamp-randomhex)
 *
 * @param prefix - ID 前缀 / ID prefix
 * @returns 唯一 ID 字符串 / Unique ID string
 */
export function generateId(prefix: string): string {
  return `${prefix}:${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
}

/**
 * 生成客户端消息 ID（前缀为 "openclaw-weixin"）
 * Generate a client message ID (prefixed with "openclaw-weixin")
 *
 * @returns 客户端 ID 字符串 / Client ID string
 */
export function generateClientId(): string {
  return generateId("openclaw-weixin");
}

/**
 * 计算数据的 MD5 哈希值
 * Calculate MD5 hash of data
 *
 * @param data - 字符串或 Buffer 数据 / String or Buffer data
 * @returns 十六进制 MD5 哈希字符串 / Hex MD5 hash string
 */
export function createMD5(data: string | Buffer) {
  return crypto.createHash("md5").update(data).digest("hex");
}

/**
 * 通过流式读取计算文件的 MD5 哈希值（适用于大文件）
 * Calculate file MD5 hash via streaming (suitable for large files)
 *
 * @param filePath - 文件路径 / File path
 * @returns Promise<十六进制 MD5 哈希字符串> / Promise<Hex MD5 hash string>
 */
export function pipeStreamMD5(filePath: string) {
  const file = createReadStream(filePath);
  const hash = crypto.createHash('md5');
  file.on('data', (chunk) => hash.update(chunk));
  return new Promise<string>((resolve, reject) => {
    file.on('end', () => resolve(hash.digest('hex')));
    file.on('error', reject);
  });
}

/**
 * 创建 API 请求头（包含认证信息）
 * Create API request headers (with authentication info)
 *
 * @param token - Bot Token 认证令牌 / Bot Token for authentication
 * @returns 请求头对象 / Request headers object
 */
export function createHeader(token: string) {
  return {
    'Content-Type': 'application/json',
    AuthorizationType: 'ilink_bot_token',
    Authorization: `Bearer ${token}`,
    'X-WECHAT-UIN': Buffer.from(
      (Math.random() * 0xffffffff + Date.now()).toString(),
    ).toString('base64'),
  }
}
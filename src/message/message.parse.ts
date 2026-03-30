/**
 * 消息解析模块
 * Message parsing module
 *
 * 提供将微信消息项解析为可用数据的功能
 * Provides functionality to parse WeChat message items into usable data
 */

import { getCdnUrl } from './../config/index';
import { MessageItem, MessageItemType } from '../types';

/**
 * 消息解析结果类型
 * Message parse result type
 *
 * - string: 文本消息内容 / Text message content
 * - { key?: Buffer, url: string }: 媒体消息（含 CDN 下载地址和可选的解密密钥）
 *   Media message (with CDN download URL and optional decryption key)
 * - Uint8ClampedArray | Blob | Buffer: 二进制数据 / Binary data
 */
export type ParseResult =
  | string
  | Uint8ClampedArray
  | Blob
  | Buffer
  | { key?: Buffer<ArrayBufferLike>; url: string };

/**
 * 消息类型解析器缓存（按 MessageItemType 映射到对应的解析函数）
 * Message type parser cache (maps MessageItemType to corresponding parse function)
 */
const CACHE_PARSE = new Map<
  number,
  (item: MessageItem) => Promise<ParseResult> | ParseResult
>();

// 注册未知类型解析器 / Register unknown type parser
CACHE_PARSE.set(MessageItemType.NONE, () => {
  return '未知消息类型';
});

// 注册文本类型解析器 / Register text type parser
CACHE_PARSE.set(MessageItemType.TEXT, (item: MessageItem) => {
  return item.text_item?.text ?? '';
});

/**
 * 媒体文件解析器（图片/语音/视频/文件通用）
 * Media file parser (shared by image/voice/video/file)
 *
 * 从消息项中提取 CDN 下载地址和 AES 解密密钥
 * Extracts CDN download URL and AES decryption key from message item
 *
 * @param item - 消息项 / Message item
 * @returns 包含 url 和可选 key 的对象，或空字符串
 *          Object with url and optional key, or empty string
 */
const fileParse = async (item: MessageItem) => {
  const dataItem = item.image_item;
  // 如果没有加密查询参数，返回空字符串 / Return empty string if no encrypted query param
  if (!dataItem?.media?.encrypt_query_param) return '';

  // 优先使用 hex 格式的 aeskey，否则使用 media 中的 base64 格式 aes_key
  // Prefer hex-format aeskey, fall back to base64-format aes_key from media
  const aesKeyBase64 = dataItem.aeskey
    ? Buffer.from(dataItem.aeskey, 'hex').toString('base64')
    : dataItem.media.aes_key;

  // 构建 CDN 下载 URL / Build CDN download URL
  const url = `${getCdnUrl()}/download?encrypted_query_param=${encodeURIComponent(dataItem.media.encrypt_query_param)}`;
  if (aesKeyBase64) {
    const key = parseAesKey(aesKeyBase64);
    return { key, url };
  } else {
    return { url };
  }
};

// 注册媒体类型解析器 / Register media type parsers
CACHE_PARSE.set(MessageItemType.IMAGE, fileParse);
CACHE_PARSE.set(MessageItemType.VOICE, fileParse);
CACHE_PARSE.set(MessageItemType.VIDEO, fileParse);
CACHE_PARSE.set(MessageItemType.FILE, fileParse);

/**
 * 解析消息项（支持单个或数组）
 * Parse message items (supports single item or array)
 *
 * @param messageItem - 单个消息项或消息项数组 / Single message item or array of message items
 * @returns 解析结果数组（可能包含 Promise）/ Array of parse results (may contain Promises)
 */
export function parseMessage(
  messageItem: MessageItem | MessageItem[],
): (Promise<ParseResult> | ParseResult)[] {
  const messageItems = Array.isArray(messageItem) ? messageItem : [messageItem];
  const results: (Promise<ParseResult> | ParseResult)[] = [];
  for (const message of messageItems) {
    const parse = CACHE_PARSE.get(message.type ?? MessageItemType.NONE);
    if (parse) {
      const result = parse(message);
      results.push(result);
    }
  }
  return results;
}

/**
 * 判断消息项是否为媒体类型（图片/视频/文件/语音）
 * Check if a message item is a media type (image/video/file/voice)
 *
 * @param item - 消息项 / Message item
 * @returns 是否为媒体类型 / Whether it is a media type
 */
export function isMediaItem(item: MessageItem): boolean {
  return (
    item.type === MessageItemType.IMAGE ||
    item.type === MessageItemType.VIDEO ||
    item.type === MessageItemType.FILE ||
    item.type === MessageItemType.VOICE
  );
}

/**
 * 解析 base64 编码的 AES 密钥
 * Parse base64-encoded AES key
 *
 * 支持两种格式：
 * Supports two formats:
 * 1. 直接 16 字节原始密钥 / Direct 16-byte raw key
 * 2. 32 字符 hex 字符串编码的密钥 / 32-char hex string encoded key
 *
 * @param aesKeyBase64 - base64 编码的 AES 密钥 / Base64-encoded AES key
 * @returns 16 字节原始密钥 Buffer / 16-byte raw key Buffer
 * @throws 密钥格式不正确时抛出错误 / Throws when key format is invalid
 */
function parseAesKey(aesKeyBase64: string): Buffer {
  const decoded = Buffer.from(aesKeyBase64, 'base64');
  // 直接是 16 字节原始密钥 / Direct 16-byte raw key
  if (decoded.length === 16) {
    return decoded;
  }
  // hex 编码的密钥：base64 → hex 字符串 → 原始字节
  // Hex-encoded key: base64 → hex string → raw bytes
  if (
    decoded.length === 32 &&
    /^[0-9a-fA-F]{32}$/.test(decoded.toString('ascii'))
  ) {
    return Buffer.from(decoded.toString('ascii'), 'hex');
  }
  const msg = ` aes_key must decode to 16 raw bytes or 32-char hex string, got ${decoded.length} bytes (base64="${aesKeyBase64}")`;
  throw new Error(msg);
}

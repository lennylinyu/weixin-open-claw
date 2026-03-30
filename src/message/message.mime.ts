/**
 * MIME 类型映射模块
 * MIME type mapping module
 *
 * 提供文件扩展名与 MIME 类型之间的双向转换
 * Provides bidirectional conversion between file extensions and MIME types
 */

import path from 'node:path';

/**
 * 文件扩展名到 MIME 类型的映射表
 * Mapping from file extensions to MIME types
 */
const EXTENSION_TO_MIME: Record<string, string> = {
  // 文档类型 / Document types
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx':
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.txt': 'text/plain',
  '.csv': 'text/csv',
  // 压缩类型 / Archive types
  '.zip': 'application/zip',
  '.tar': 'application/x-tar',
  '.gz': 'application/gzip',
  // 音频类型 / Audio types
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  // 视频类型 / Video types
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.mkv': 'video/x-matroska',
  '.avi': 'video/x-msvideo',
  // 图片类型 / Image types
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
};

/**
 * MIME 类型到文件扩展名的映射表
 * Mapping from MIME types to file extensions
 */
const MIME_TO_EXTENSION: Record<string, string> = {
  // 图片类型 / Image types
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/bmp': '.bmp',
  // 视频类型 / Video types
  'video/mp4': '.mp4',
  'video/quicktime': '.mov',
  'video/webm': '.webm',
  'video/x-matroska': '.mkv',
  'video/x-msvideo': '.avi',
  // 音频类型 / Audio types
  'audio/mpeg': '.mp3',
  'audio/ogg': '.ogg',
  'audio/wav': '.wav',
  // 文档/压缩类型 / Document/Archive types
  'application/pdf': '.pdf',
  'application/zip': '.zip',
  'application/x-tar': '.tar',
  'application/gzip': '.gz',
  'text/plain': '.txt',
  'text/csv': '.csv',
};

/**
 * 根据文件名获取 MIME 类型
 * Get MIME type from filename extension
 *
 * @param filename - 文件名 / Filename
 * @returns MIME 类型字符串，未知扩展名返回 "application/octet-stream"
 *          MIME type string, returns "application/octet-stream" for unknown extensions
 */
export function getMimeFromFilename(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return EXTENSION_TO_MIME[ext] ?? 'application/octet-stream';
}

/**
 * 根据 MIME 类型获取文件扩展名
 * Get file extension from MIME type
 *
 * @param mimeType - MIME 类型字符串（可包含参数，如 "image/jpeg; charset=utf-8"）
 *                   MIME type string (may include params, e.g. "image/jpeg; charset=utf-8")
 * @returns 文件扩展名（含点号），未知类型返回 ".bin"
 *          File extension (with dot), returns ".bin" for unknown types
 */
export function getExtensionFromMime(mimeType: string): string {
  // 去除参数部分 / Strip parameters
  const ct = mimeType.split(';')[0].trim().toLowerCase();
  return MIME_TO_EXTENSION[ct] ?? '.bin';
}

/**
 * 根据 Content-Type 头或 URL 路径获取文件扩展名
 * Get file extension from Content-Type header or URL path
 *
 * 优先使用 Content-Type，如果无法识别则从 URL 路径中提取扩展名
 * Prefers Content-Type; falls back to extracting extension from URL path
 *
 * @param contentType - Content-Type 头（可为 null）/ Content-Type header (may be null)
 * @param url - 资源 URL / Resource URL
 * @returns 文件扩展名（含点号），无法识别时返回 ".bin"
 *          File extension (with dot), returns ".bin" when unrecognizable
 */
export function getExtensionFromContentTypeOrUrl(
  contentType: string | null,
  url: string,
): string {
  // 优先尝试 Content-Type / Try Content-Type first
  if (contentType) {
    const ext = getExtensionFromMime(contentType);
    if (ext !== '.bin') return ext;
  }
  // 回退到 URL 路径扩展名 / Fall back to URL path extension
  const ext = path.extname(new URL(url).pathname).toLowerCase();
  const knownExts = new Set(Object.keys(EXTENSION_TO_MIME));
  return knownExts.has(ext) ? ext : '.bin';
}

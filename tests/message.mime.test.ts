/**
 * MIME 类型映射模块测试
 * MIME type mapping module tests
 */

import { describe, it, expect } from 'vitest';
import { getMimeFromFilename, getExtensionFromMime, getExtensionFromContentTypeOrUrl } from '../src/message/message.mime';

describe('getMimeFromFilename', () => {
  // 测试 png 的 MIME 类型 / Test MIME type for png
  it('should return MIME type for png / 应该返回 png 的 MIME 类型', () => {
    expect(getMimeFromFilename('image.png')).toBe('image/png');
  });

  // 测试 jpg 的 MIME 类型 / Test MIME type for jpg
  it('should return MIME type for jpg / 应该返回 jpg 的 MIME 类型', () => {
    expect(getMimeFromFilename('photo.jpg')).toBe('image/jpeg');
  });

  // 测试 pdf 的 MIME 类型 / Test MIME type for pdf
  it('should return MIME type for pdf / 应该返回 pdf 的 MIME 类型', () => {
    expect(getMimeFromFilename('document.pdf')).toBe('application/pdf');
  });

  // 测试 mp4 的 MIME 类型 / Test MIME type for mp4
  it('should return MIME type for mp4 / 应该返回 mp4 的 MIME 类型', () => {
    expect(getMimeFromFilename('video.mp4')).toBe('video/mp4');
  });

  // 测试 mp3 的 MIME 类型 / Test MIME type for mp3
  it('should return MIME type for mp3 / 应该返回 mp3 的 MIME 类型', () => {
    expect(getMimeFromFilename('audio.mp3')).toBe('audio/mpeg');
  });

  // 测试未知扩展名 / Test unknown extension
  it('unknown extension should return application/octet-stream / 未知扩展名应该返回 application/octet-stream', () => {
    expect(getMimeFromFilename('file.xyz')).toBe('application/octet-stream');
  });

  // 测试大小写不敏感 / Test case insensitivity
  it('should be case insensitive / 大小写不敏感', () => {
    expect(getMimeFromFilename('IMAGE.PNG')).toBe('image/png');
  });
});

describe('getExtensionFromMime', () => {
  // 测试 image/jpeg 的扩展名 / Test extension for image/jpeg
  it('should return extension for image/jpeg / 应该返回 image/jpeg 的扩展名', () => {
    expect(getExtensionFromMime('image/jpeg')).toBe('.jpg');
  });

  // 测试 image/png 的扩展名 / Test extension for image/png
  it('should return extension for image/png / 应该返回 image/png 的扩展名', () => {
    expect(getExtensionFromMime('image/png')).toBe('.png');
  });

  // 测试 video/mp4 的扩展名 / Test extension for video/mp4
  it('should return extension for video/mp4 / 应该返回 video/mp4 的扩展名', () => {
    expect(getExtensionFromMime('video/mp4')).toBe('.mp4');
  });

  // 测试带参数的 Content-Type / Test Content-Type with parameters
  it('should handle Content-Type with parameters / 应该处理带参数的 Content-Type', () => {
    expect(getExtensionFromMime('image/jpeg; charset=utf-8')).toBe('.jpg');
  });

  // 测试未知 MIME 类型 / Test unknown MIME type
  it('unknown MIME type should return .bin / 未知 MIME 类型应该返回 .bin', () => {
    expect(getExtensionFromMime('application/unknown')).toBe('.bin');
  });
});

describe('getExtensionFromContentTypeOrUrl', () => {
  // 测试优先使用 Content-Type / Test Content-Type takes priority
  it('should prefer Content-Type / 优先使用 Content-Type', () => {
    expect(getExtensionFromContentTypeOrUrl('image/png', 'https://example.com/file')).toBe('.png');
  });

  // 测试 Content-Type 未知时回退到 URL / Test fallback to URL when Content-Type is unknown
  it('should fallback to URL when Content-Type is unknown / Content-Type 未知时使用 URL 路径', () => {
    expect(getExtensionFromContentTypeOrUrl('application/unknown', 'https://example.com/file.jpg')).toBe('.jpg');
  });

  // 测试 Content-Type 为 null 时使用 URL / Test using URL when Content-Type is null
  it('should use URL when Content-Type is null / Content-Type 为 null 时使用 URL 路径', () => {
    expect(getExtensionFromContentTypeOrUrl(null, 'https://example.com/photo.png')).toBe('.png');
  });

  // 测试都无法识别时返回 .bin / Test returning .bin when both are unrecognizable
  it('should return .bin when both are unrecognizable / 都无法识别时返回 .bin', () => {
    expect(getExtensionFromContentTypeOrUrl(null, 'https://example.com/file')).toBe('.bin');
  });
});

/**
 * 消息解析模块测试
 * Message parsing module tests
 */

import { describe, it, expect } from 'vitest';
import { parseMessage, isMediaItem } from '../src/message/message.parse';
import { MessageItemType } from '../src/types';
import type { MessageItem } from '../src/types';

describe('parseMessage', () => {
  // 测试解析文本消息 / Test parsing text message
  it('should parse text message / 应该解析文本消息', () => {
    const item: MessageItem = {
      type: MessageItemType.TEXT,
      text_item: { text: '你好世界' },
    };
    const results = parseMessage(item);
    expect(results).toHaveLength(1);
    expect(results[0]).toBe('你好世界');
  });

  // 测试空文本返回空字符串 / Test empty text returns empty string
  it('empty text should return empty string / 空文本应该返回空字符串', () => {
    const item: MessageItem = {
      type: MessageItemType.TEXT,
      text_item: {},
    };
    const results = parseMessage(item);
    expect(results).toHaveLength(1);
    expect(results[0]).toBe('');
  });

  // 测试未知类型返回提示文本 / Test unknown type returns hint text
  it('unknown type should return hint text / 未知类型应该返回提示文本', () => {
    const item: MessageItem = {
      type: MessageItemType.NONE,
    };
    const results = parseMessage(item);
    expect(results).toHaveLength(1);
    expect(results[0]).toBe('未知消息类型');
  });

  // 测试解析图片消息为包含 url 的对象 / Test parsing image message to object with url
  it('should parse image message to object with url / 应该解析图片消息为包含 url 的对象', async () => {
    const item: MessageItem = {
      type: MessageItemType.IMAGE,
      image_item: {
        aeskey: 'aabbccdd11223344aabbccdd11223344',
        media: {
          encrypt_query_param: 'test-encrypted-param',
          aes_key: 'dGVzdA==',
        },
      },
    };
    const results = parseMessage(item);
    expect(results).toHaveLength(1);
    const parsed = await results[0];
    expect(parsed).toHaveProperty('url');
    expect((parsed as { url: string }).url).toContain('test-encrypted-param');
  });

  // 测试处理消息数组 / Test handling message array
  it('should handle message array / 应该处理消息数组', () => {
    const items: MessageItem[] = [
      { type: MessageItemType.TEXT, text_item: { text: '消息1' } },
      { type: MessageItemType.TEXT, text_item: { text: '消息2' } },
    ];
    const results = parseMessage(items);
    expect(results).toHaveLength(2);
    expect(results[0]).toBe('消息1');
    expect(results[1]).toBe('消息2');
  });

  // 测试图片消息没有 encrypt_query_param 时返回空字符串
  // Test image message without encrypt_query_param returns empty string
  it('image without encrypt_query_param should return empty string / 图片消息没有 encrypt_query_param 应该返回空字符串', async () => {
    const item: MessageItem = {
      type: MessageItemType.IMAGE,
      image_item: {
        media: {},
      },
    };
    const results = parseMessage(item);
    expect(results).toHaveLength(1);
    const parsed = await results[0];
    expect(parsed).toBe('');
  });
});

describe('isMediaItem', () => {
  // 测试图片类型 / Test image type
  it('image type should return true / 图片类型应该返回 true', () => {
    expect(isMediaItem({ type: MessageItemType.IMAGE })).toBe(true);
  });

  // 测试视频类型 / Test video type
  it('video type should return true / 视频类型应该返回 true', () => {
    expect(isMediaItem({ type: MessageItemType.VIDEO })).toBe(true);
  });

  // 测试文件类型 / Test file type
  it('file type should return true / 文件类型应该返回 true', () => {
    expect(isMediaItem({ type: MessageItemType.FILE })).toBe(true);
  });

  // 测试语音类型 / Test voice type
  it('voice type should return true / 语音类型应该返回 true', () => {
    expect(isMediaItem({ type: MessageItemType.VOICE })).toBe(true);
  });

  // 测试文本类型 / Test text type
  it('text type should return false / 文本类型应该返回 false', () => {
    expect(isMediaItem({ type: MessageItemType.TEXT })).toBe(false);
  });

  // 测试 NONE 类型 / Test NONE type
  it('NONE type should return false / NONE 类型应该返回 false', () => {
    expect(isMediaItem({ type: MessageItemType.NONE })).toBe(false);
  });
});

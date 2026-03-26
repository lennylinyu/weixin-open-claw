/**
 * 消息创建模块测试
 * Message creation module tests
 */

import { describe, it, expect } from 'vitest';
import { createTextMessage, createFileMessage, createImageMessage, createVideoMessage } from '../src/message/message.create';
import { MessageType, MessageState, MessageItemType } from '../src/types';
import crypto from 'node:crypto';
import type { FileUploadInfo } from '../src/message/message.upload';

describe('createTextMessage', () => {
  // 测试创建包含文本内容的消息 / Test creating message with text content
  it('should create message with text content / 应该创建包含文本内容的消息', () => {
    const msg = createTextMessage({ to: 'user-123', text: '你好' });

    expect(msg.msg).toBeDefined();
    expect(msg.msg!.to_user_id).toBe('user-123');
    expect(msg.msg!.from_user_id).toBe('');
    expect(msg.msg!.message_type).toBe(MessageType.BOT);
    expect(msg.msg!.message_state).toBe(MessageState.FINISH);
    expect(msg.msg!.item_list).toHaveLength(1);
    expect(msg.msg!.item_list![0].type).toBe(MessageItemType.TEXT);
    expect(msg.msg!.item_list![0].text_item?.text).toBe('你好');
  });

  // 测试空文本创建没有 item_list 的消息 / Test empty text creates message without item_list
  it('empty text should create message without item_list / 空文本应该创建没有 item_list 的消息', () => {
    const msg = createTextMessage({ to: 'user-123', text: '' });

    expect(msg.msg).toBeDefined();
    expect(msg.msg!.item_list).toBeUndefined();
  });

  // 测试生成 client_id / Test generating client_id
  it('should generate client_id / 应该生成 client_id', () => {
    const msg = createTextMessage({ to: 'user-123', text: 'test' });
    expect(msg.msg!.client_id).toBeDefined();
    expect(msg.msg!.client_id!.startsWith('openclaw-weixin:')).toBe(true);
  });
});

/**
 * 创建模拟文件上传信息
 * Create mock file upload info
 *
 * @param overrides - 覆盖的字段 / Fields to override
 * @returns 模拟的文件上传信息 / Mock file upload info
 */
function createMockFileInfo(overrides?: Partial<FileUploadInfo>): FileUploadInfo {
  return {
    buffer: Buffer.from('test'),
    md5: 'abc123',
    filesize: 16,
    size: 4,
    filekey: crypto.randomBytes(16),
    aeskey: crypto.randomBytes(16),
    mediaType: 3,
    fileName: 'test.txt',
    downdownURL: 'encrypted-param-value',
    ...overrides,
  };
}

describe('createFileMessage', () => {
  // 测试创建文件消息项 / Test creating file message item
  it('should create file message item / 应该创建文件消息项', () => {
    const info = createMockFileInfo();
    const item = createFileMessage({ to: 'user-123', info });

    expect(item.type).toBe(MessageItemType.FILE);
    expect(item.file_item).toBeDefined();
    expect(item.file_item!.file_name).toBe('test.txt');
    expect(item.file_item!.media?.encrypt_query_param).toBe('encrypted-param-value');
    expect(item.file_item!.media?.encrypt_type).toBe(1);
    expect(item.file_item!.len).toBe('16');
  });
});

describe('createImageMessage', () => {
  // 测试创建图片消息项 / Test creating image message item
  it('should create image message item / 应该创建图片消息项', () => {
    const info = createMockFileInfo({ filesize: 84183 });
    const item = createImageMessage({ to: 'user-123', info });

    expect(item.type).toBe(MessageItemType.IMAGE);
    expect(item.image_item).toBeDefined();
    expect(item.image_item!.mid_size).toBe(84183);
    expect(item.image_item!.media?.encrypt_query_param).toBe('encrypted-param-value');
  });
});

describe('createVideoMessage', () => {
  // 测试创建视频消息项 / Test creating video message item
  it('should create video message item / 应该创建视频消息项', () => {
    const info = createMockFileInfo({ filesize: 102400 });
    const item = createVideoMessage({ to: 'user-123', info });

    expect(item.type).toBe(MessageItemType.VIDEO);
    expect(item.video_item).toBeDefined();
    expect(item.video_item!.video_size).toBe(102400);
    expect(item.video_item!.media?.encrypt_query_param).toBe('encrypted-param-value');
  });
});

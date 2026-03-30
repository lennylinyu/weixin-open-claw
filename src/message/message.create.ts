/**
 * 消息创建模块
 * Message creation module
 *
 * 提供创建文本、文件、图片、视频消息以及发送消息的功能
 * Provides functions to create text, file, image, video messages and send messages
 */

import { buildBaseInfo } from '../config';
import {
  MessageItem,
  MessageItemType,
  MessageState,
  MessageType,
  SendMessageReq,
} from '../types';
import { createHeader, generateClientId } from '../utils/utils';
import { FileUploadInfo } from './message.upload';

/**
 * 创建文本消息请求体
 * Create a text message request body
 *
 * @param params - 参数对象 / Parameter object
 * @param params.to - 目标用户 ID / Target user ID
 * @param params.text - 文本内容（空字符串时 item_list 为 undefined）/ Text content (item_list is undefined when empty)
 * @returns 发送消息请求体 / Send message request body
 */
export function createTextMessage(params: {
  to: string;
  text: string;
}): SendMessageReq {
  const { to, text } = params;
  // 构建文本消息项列表 / Build text message item list
  const item_list: MessageItem[] = text
    ? [{ type: MessageItemType.TEXT, text_item: { text } }]
    : [];
  return {
    msg: {
      from_user_id: '',
      to_user_id: to,
      client_id: generateClientId(),
      message_type: MessageType.BOT,
      message_state: MessageState.FINISH,
      item_list: item_list.length ? item_list : undefined,
    },
  };
}

/**
 * 创建文件消息项
 * Create a file message item
 *
 * @param params - 参数对象 / Parameter object
 * @param params.to - 目标用户 ID / Target user ID
 * @param params.info - 文件上传信息 / File upload info
 * @returns 文件消息项 / File message item
 */
export function createFileMessage(params: {
  to: string;
  info: FileUploadInfo;
}): MessageItem {
  return {
    type: MessageItemType.FILE,
    file_item: {
      media: {
        encrypt_query_param: params.info.downdownURL,
        // 将 AES 密钥转换为 base64 编码 / Convert AES key to base64 encoding
        aes_key: Buffer.from(params.info.aeskey.toString('hex')).toString(
          'base64',
        ),
        encrypt_type: 1,
      },
      file_name: params.info.fileName,
      len: params.info.filesize.toString(),
    },
  };
}

/**
 * 创建图片消息项
 * Create an image message item
 *
 * @param params - 参数对象 / Parameter object
 * @param params.to - 目标用户 ID / Target user ID
 * @param params.info - 文件上传信息 / File upload info
 * @returns 图片消息项 / Image message item
 */
export function createImageMessage(params: {
  to: string;
  info: FileUploadInfo;
}): MessageItem {
  return {
    type: MessageItemType.IMAGE,
    image_item: {
      media: {
        encrypt_query_param: params.info.downdownURL,
        // 将 AES 密钥转换为 base64 编码 / Convert AES key to base64 encoding
        aes_key: Buffer.from(params.info.aeskey.toString('hex')).toString(
          'base64',
        ),
        encrypt_type: 1,
      },
      mid_size: params.info.filesize,
    },
  };
}

/**
 * 创建视频消息项
 * Create a video message item
 *
 * @param params - 参数对象 / Parameter object
 * @param params.to - 目标用户 ID / Target user ID
 * @param params.info - 文件上传信息 / File upload info
 * @returns 视频消息项 / Video message item
 */
export function createVideoMessage(params: {
  to: string;
  info: FileUploadInfo;
}): MessageItem {
  return {
    type: MessageItemType.VIDEO,
    video_item: {
      media: {
        encrypt_query_param: params.info.downdownURL,
        // 将 AES 密钥转换为 base64 编码 / Convert AES key to base64 encoding
        aes_key: Buffer.from(params.info.aeskey.toString('hex')).toString(
          'base64',
        ),
        encrypt_type: 1,
      },
      video_size: params.info.filesize,
    },
  };
}

/**
 * 发送消息到微信服务器
 * Send message to WeChat server
 *
 * @param params - 参数对象 / Parameter object
 * @param params.baseUrl - API 基础地址 / API base URL
 * @param params.message - 消息请求体 / Message request body
 * @param params.contextToken - Bot Token 认证令牌 / Bot Token for authentication
 * @returns fetch 响应 Promise / fetch response Promise
 */
export function sendMessage(params: {
  baseUrl: string;
  message: SendMessageReq;
  contextToken: string;
}) {
  const { message, contextToken, baseUrl } = params;
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const url = new URL('ilink/bot/sendmessage', base);
  return fetch(url, {
    headers: createHeader(contextToken),
    method: 'POST',
    body: JSON.stringify({ ...message, base_info: buildBaseInfo() }),
  });
}

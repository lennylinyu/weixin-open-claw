/**
 * 核心客户端类
 * Core client class
 *
 * 提供扫码登录、消息收发、文件上传等核心功能
 * Provides QR code login, message sending/receiving, file upload and other core features
 */

import {
  MessageItem,
  MessageState,
  MessageType,
  UploadMediaType,
} from './../types';

import { fetchQRCode } from '../auth';
import {
  getBotType,
  getCdnUrl,
  getDefaultBaseUrl,
  SESSION_EXPIRED_ERRCODE,
  WEIXIN_DEFAULT_BASE_URL,
} from '../config';
import {
  createFileMessage,
  createImageMessage,
  createTextMessage,
  createVideoMessage,
  sendMessage,
} from '../message/message.create';
import { parseMessage, ParseResult } from '../message/message.parse';
import {
  createFileInfo,
  createUploadURL,
  uploadFileToCND,
} from '../message/message.upload';
import { GetUpdatesResp, SendMessageReq } from '../types';
import { createHeader, generateClientId } from '../utils/utils';

/**
 * 消息更新结果类型（扩展 GetUpdatesResp，附加解析后的消息列表）
 * Message update result type (extends GetUpdatesResp with parsed message list)
 */
type IMessageResult = GetUpdatesResp & {
  results?: (Promise<ParseResult> | ParseResult)[];
};

/**
 * 微信开放平台 iLink Bot 客户端
 * WeChat Open Platform iLink Bot Client
 *
 * 用于与微信 iLink Bot 服务进行交互，支持：
 * Used to interact with WeChat iLink Bot service, supports:
 * - 扫码登录 / QR code login
 * - 发送文本消息 / Send text messages
 * - 发送文件/图片/视频 / Send files/images/videos
 * - 长轮询接收消息 / Long-polling to receive messages
 *
 * @example
 * ```typescript
 * // 创建客户端 / Create client
 * const client = Client.create(userID, botID, botToken);
 *
 * // 发送文本 / Send text
 * await client.sendMessageByText('Hello!');
 *
 * // 接收消息 / Receive messages
 * const resp = await client.updateMessage();
 * ```
 */
export default class Client {
  /**
   * 发起扫码登录
   * Initiate QR code login
   *
   * @param botType - Bot 类型，默认使用全局配置 / Bot type, defaults to global config
   * @returns 异步生成器，产出登录事件 / AsyncGenerator yielding login events
   */
  static login(botType = getBotType()) {
    return fetchQRCode(getDefaultBaseUrl(), botType);
  }

  /**
   * 创建客户端实例（工厂方法）
   * Create a client instance (factory method)
   *
   * @param userID - 用户 ID / User ID
   * @param botID - Bot ID / Bot ID
   * @param botToken - Bot Token 认证令牌 / Bot Token for authentication
   * @returns Client 实例 / Client instance
   */
  static create(userID: string, botID: string, botToken: string) {
    return new Client(userID, botID, botToken);
  }

  /** 请求头（包含认证信息）/ Request headers (with auth info) */
  protected $header: {
    'Content-Type': string;
    AuthorizationType: string;
    Authorization: string;
    'X-WECHAT-UIN': string;
  };

  /** API 基础地址 / API base URL */
  protected $apiBaseURL: string = WEIXIN_DEFAULT_BASE_URL;

  /** 消息偏移量（用于长轮询）/ Message offset (for long-polling) */
  protected $offset: string = '';
  /** 是否已停止 / Whether stopped */
  protected $isStop: boolean = false;
  /** 请求中止控制器 / Request abort controller */
  protected $controller: AbortController | null = null;

  /**
   * 构造函数
   * Constructor
   *
   * @param $userID - 用户 ID / User ID
   * @param $botID - Bot ID / Bot ID
   * @param $botToken - Bot Token 认证令牌 / Bot Token for authentication
   */
  constructor(
    protected $userID: string,
    protected $botID: string,
    protected $botToken: string,
  ) {
    this.$header = createHeader(this.$botToken);
    this.$apiBaseURL = getDefaultBaseUrl();
  }

  /**
   * 发送自定义消息
   * Send a custom message
   *
   * @param message - 消息请求体 / Message request body
   * @returns 包含 messageID 的结果 / Result containing messageID
   */
  sendMessage(message: SendMessageReq) {
    return sendMessage({
      baseUrl: this.$apiBaseURL,
      message,
      contextToken: this.$botToken,
    }).then(() => {
      return { messageID: message.msg?.client_id };
    });
  }

  /**
   * 发送文本消息
   * Send a text message
   *
   * @param text - 文本内容 / Text content
   * @returns 包含 messageID 的结果 / Result containing messageID
   */
  sendMessageByText(text: string) {
    return this.sendMessage(createTextMessage({ to: this.$userID, text }));
  }

  /**
   * 发送文件消息（支持图片、视频、普通文件）
   * Send a file message (supports image, video, and general files)
   *
   * 完整流程：读取文件 → 创建上传信息 → 获取上传 URL → 加密上传到 CDN → 构造消息 → 发送
   * Full flow: read file → create upload info → get upload URL → encrypt & upload to CDN → build message → send
   *
   * @param file - 文件路径、File 对象或 Buffer / File path, File object, or Buffer
   * @param fileType - 文件类型，默认为 FILE / File type, defaults to FILE
   * @returns 包含 messageID 的结果，或 undefined / Result containing messageID, or undefined
   */
  async sendMessageByFile(
    file: File | Buffer | string,
    fileType: (typeof UploadMediaType)[keyof typeof UploadMediaType] = UploadMediaType.FILE,
  ) {
    // 创建文件上传信息 / Create file upload info
    const info = await createFileInfo(file, fileType);

    // 获取 CDN 上传 URL / Get CDN upload URL
    const uploadURL = await createUploadURL({
      baseUrl: this.$apiBaseURL,
      token: this.$botToken,
      userID: this.$userID,
      fileInfo: info,
    });
    info.cdnURL = uploadURL.upload_param;

    // 上传加密文件到 CDN / Upload encrypted file to CDN
    info.downdownURL =
      (await uploadFileToCND({ baseUrl: getCdnUrl(), info })) ?? '';

    // 根据文件类型创建对应的消息项 / Create message item based on file type
    const messageItems: MessageItem[] = [];
    switch (fileType) {
      case UploadMediaType.IMAGE:
        messageItems.push(createImageMessage({ to: this.$userID, info }));
        break;
      case UploadMediaType.VIDEO:
        messageItems.push(createVideoMessage({ to: this.$userID, info }));
        break;
      default:
        messageItems.push(createFileMessage({ to: this.$userID, info }));
        break;
    }

    if (messageItems.length === 0) {
      return Promise.resolve(undefined);
    }

    // 发送消息 / Send message
    return this.sendMessage({
      msg: {
        from_user_id: '',
        to_user_id: this.$userID,
        client_id: generateClientId(),
        message_type: MessageType.BOT,
        message_state: MessageState.FINISH,
        item_list: messageItems,
        context_token: this.$botToken,
      },
    });
  }

  /**
   * 重置客户端状态（清除偏移量和停止标志）
   * Reset client state (clear offset and stop flag)
   */
  reset() {
    this.$offset = '';
    this.$isStop = false;
    this.stop();
  }

  /**
   * 长轮询获取新消息
   * Long-poll for new messages
   *
   * 向服务器发送 getUpdates 请求，获取新消息并自动解析
   * Sends getUpdates request to server, fetches new messages and auto-parses them
   *
   * @returns 消息更新结果（包含原始响应和解析后的消息列表）
   *          Message update result (contains raw response and parsed message list)
   * @throws 会话过期时抛出 "session expired" 错误 / Throws "session expired" when session expires
   */
  async updateMessage(): Promise<IMessageResult> {
    const headers = this.$header;
    this.$isStop = false;

    // 构建请求 URL / Build request URL
    const base = this.$apiBaseURL.endsWith('/')
      ? this.$apiBaseURL
      : `${this.$apiBaseURL}/`;
    const url = new URL(`ilink/bot/getUpdates`, base);

    // 创建中止控制器（用于 stop() 方法）/ Create abort controller (for stop() method)
    this.$controller = new AbortController();

    // 发送长轮询请求 / Send long-poll request
    const resp = await fetch(url, {
      headers,
      method: 'POST',
      body: JSON.stringify({ get_updates_buf: this.$offset }),
      signal: this.$controller.signal,
    }).then((res) => res.json() as unknown as IMessageResult);

    // 更新偏移量 / Update offset
    if (resp.ret === 0) {
      this.$offset = resp.get_updates_buf ?? '';
    }

    // 检查会话是否过期 / Check if session expired
    if (
      resp.ret === SESSION_EXPIRED_ERRCODE ||
      resp.errcode === SESSION_EXPIRED_ERRCODE
    ) {
      throw new Error('session expired');
    }

    // 解析消息 / Parse messages
    resp.results = parseMessage(resp.msgs ?? []);

    return resp;
  }

  /**
   * 停止当前长轮询请求
   * Stop the current long-poll request
   */
  stop() {
    this.$isStop = true;
    this.$controller?.abort();
  }

  /**
   * 设置 API 基础地址
   * Set API base URL
   */
  set apiBaseURL(url: string) {
    this.$apiBaseURL = url;
  }

  /**
   * 获取 API 基础地址
   * Get API base URL
   */
  get apiBaseURL() {
    return this.$apiBaseURL;
  }
}

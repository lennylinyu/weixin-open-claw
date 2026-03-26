/**
 * 类型定义文件
 * Type definitions file
 *
 * 定义微信开放平台 iLink Bot SDK 中使用的所有协议类型
 * Defines all protocol types used in the WeChat Open Platform iLink Bot SDK
 *
 * 微信协议类型（对应 proto: GetUpdatesReq/Resp, WeixinMessage, SendMessageReq）
 * Weixin protocol types (mirrors proto: GetUpdatesReq/Resp, WeixinMessage, SendMessageReq)
 * API 使用 JSON over HTTP；bytes 字段在 JSON 中为 base64 字符串
 * API uses JSON over HTTP; bytes fields are base64 strings in JSON
 */

/**
 * 微信开放平台配置
 * WeChat Open Platform configuration
 */
export interface WeixinOpenConfig {
  /** 应用 ID / App ID */
  appId: string;
  /** 应用密钥 / App secret */
  appSecret: string;
  /** 令牌 / Token */
  token?: string;
  /** 消息加解密密钥 / Message encryption/decryption key */
  encodingAESKey?: string;
}

/**
 * 初始化选项
 * Initialization options
 */
export interface WeixinOpenOptions {
  /** 请求超时时间(ms)，默认 10000 / Request timeout in ms, defaults to 10000 */
  timeout?: number;
  /** 是否开启调试模式 / Whether to enable debug mode */
  debug?: boolean;
  /** 自定义日志函数 / Custom logger function */
  logger?: (message: string, ...args: unknown[]) => void;
}

/**
 * 通用请求元数据（附加到每个 CGI 请求）
 * Common request metadata attached to every CGI request
 */
export interface BaseInfo {
  /** 渠道版本号 / Channel version */
  channel_version?: string;
}

/**
 * 上传媒体类型枚举
 * Upload media type enum
 *
 * 对应 proto: UploadMediaType
 * Corresponds to proto: UploadMediaType
 */
export const UploadMediaType = {
  /** 图片 / Image */
  IMAGE: 1,
  /** 视频 / Video */
  VIDEO: 2,
  /** 文件 / File */
  FILE: 3,
  /** 语音 / Voice */
  VOICE: 4,
} as const;

/**
 * 获取上传 URL 请求
 * Get upload URL request
 */
export interface GetUploadUrlReq {
  /** 文件密钥 / File key */
  filekey?: string;
  /** 媒体类型（proto field 2），参见 UploadMediaType / Media type (proto field 2), see UploadMediaType */
  media_type?: number;
  /** 目标用户 ID / Target user ID */
  to_user_id?: string;
  /** 原文件明文大小 / Raw file plaintext size */
  rawsize?: number;
  /** 原文件明文 MD5 / Raw file plaintext MD5 */
  rawfilemd5?: string;
  /** 原文件密文大小（AES-128-ECB 加密后）/ Encrypted file size (after AES-128-ECB) */
  filesize?: number;
  /** 缩略图明文大小（IMAGE/VIDEO 时必填）/ Thumbnail plaintext size (required for IMAGE/VIDEO) */
  thumb_rawsize?: number;
  /** 缩略图明文 MD5（IMAGE/VIDEO 时必填）/ Thumbnail plaintext MD5 (required for IMAGE/VIDEO) */
  thumb_rawfilemd5?: string;
  /** 缩略图密文大小（IMAGE/VIDEO 时必填）/ Thumbnail encrypted size (required for IMAGE/VIDEO) */
  thumb_filesize?: number;
  /** 不需要缩略图上传 URL，默认 false / No thumbnail upload URL needed, defaults to false */
  no_need_thumb?: boolean;
  /** 加密密钥 / Encryption key */
  aeskey?: string;
}

/**
 * 获取上传 URL 响应
 * Get upload URL response
 */
export interface GetUploadUrlResp {
  /** 原图上传加密参数 / Original image upload encrypted param */
  upload_param?: string;
  /** 缩略图上传加密参数，无缩略图时为空 / Thumbnail upload encrypted param, empty when no thumbnail */
  thumb_upload_param?: string;
}

/**
 * 消息类型枚举
 * Message type enum
 */
export const MessageType = {
  /** 无 / None */
  NONE: 0,
  /** 用户消息 / User message */
  USER: 1,
  /** Bot 消息 / Bot message */
  BOT: 2,
} as const;

/**
 * 消息项类型枚举
 * Message item type enum
 */
export const MessageItemType = {
  /** 无 / None */
  NONE: 0,
  /** 文本 / Text */
  TEXT: 1,
  /** 图片 / Image */
  IMAGE: 2,
  /** 语音 / Voice */
  VOICE: 3,
  /** 文件 / File */
  FILE: 4,
  /** 视频 / Video */
  VIDEO: 5,
} as const;

/**
 * 消息状态枚举
 * Message state enum
 */
export const MessageState = {
  /** 新消息 / New message */
  NEW: 0,
  /** 生成中 / Generating */
  GENERATING: 1,
  /** 已完成 / Finished */
  FINISH: 2,
} as const;

/**
 * 文本消息项
 * Text message item
 */
export interface TextItem {
  /** 文本内容 / Text content */
  text?: string;
}

/**
 * CDN 媒体引用
 * CDN media reference
 *
 * aes_key 在 JSON 中为 base64 编码的字节
 * aes_key is base64-encoded bytes in JSON
 */
export interface CDNMedia {
  /** 加密查询参数 / Encrypted query parameter */
  encrypt_query_param?: string;
  /** AES 密钥（base64 编码）/ AES key (base64 encoded) */
  aes_key?: string;
  /** 加密类型: 0=只加密 fileid, 1=打包缩略图/中图等信息 / Encrypt type: 0=encrypt fileid only, 1=pack thumbnail/mid-size info */
  encrypt_type?: number;
}

/**
 * 图片消息项
 * Image message item
 */
export interface ImageItem {
  /** 原图 CDN 引用 / Original image CDN reference */
  media?: CDNMedia;
  /** 缩略图 CDN 引用 / Thumbnail CDN reference */
  thumb_media?: CDNMedia;
  /** 原始 AES-128 密钥（hex 字符串，16 字节）；入站解密时优先于 media.aes_key / Raw AES-128 key as hex string (16 bytes); preferred over media.aes_key for inbound decryption */
  aeskey?: string;
  /** 图片 URL / Image URL */
  url?: string;
  /** 中图大小 / Mid-size image size */
  mid_size?: number;
  /** 缩略图大小 / Thumbnail size */
  thumb_size?: number;
  /** 缩略图高度 / Thumbnail height */
  thumb_height?: number;
  /** 缩略图宽度 / Thumbnail width */
  thumb_width?: number;
  /** 高清图大小 / HD image size */
  hd_size?: number;
}

/**
 * 语音消息项
 * Voice message item
 */
export interface VoiceItem {
  /** 语音 CDN 引用 / Voice CDN reference */
  media?: CDNMedia;
  /** 语音编码类型：1=pcm 2=adpcm 3=feature 4=speex 5=amr 6=silk 7=mp3 8=ogg-speex / Voice encode type */
  encode_type?: number;
  /** 每样本位数 / Bits per sample */
  bits_per_sample?: number;
  /** 采样率 (Hz) / Sample rate (Hz) */
  sample_rate?: number;
  /** 语音长度（毫秒）/ Voice duration in milliseconds */
  playtime?: number;
  /** 语音转文字内容 / Voice-to-text content */
  text?: string;
}

/**
 * 文件消息项
 * File message item
 */
export interface FileItem {
  /** 文件 CDN 引用 / File CDN reference */
  media?: CDNMedia;
  /** 文件名 / File name */
  file_name?: string;
  /** 文件 MD5 / File MD5 */
  md5?: string;
  /** 文件大小（字符串）/ File size (string) */
  len?: string;
}

/**
 * 视频消息项
 * Video message item
 */
export interface VideoItem {
  /** 视频 CDN 引用 / Video CDN reference */
  media?: CDNMedia;
  /** 视频大小 / Video size */
  video_size?: number;
  /** 播放时长 / Play duration */
  play_length?: number;
  /** 视频 MD5 / Video MD5 */
  video_md5?: string;
  /** 缩略图 CDN 引用 / Thumbnail CDN reference */
  thumb_media?: CDNMedia;
  /** 缩略图大小 / Thumbnail size */
  thumb_size?: number;
  /** 缩略图高度 / Thumbnail height */
  thumb_height?: number;
  /** 缩略图宽度 / Thumbnail width */
  thumb_width?: number;
}

/**
 * 引用消息
 * Referenced message
 */
export interface RefMessage {
  /** 被引用的消息项 / Referenced message item */
  message_item?: MessageItem;
  /** 摘要 / Summary */
  title?: string;
}

/**
 * 消息项（包含各种类型的消息内容）
 * Message item (contains various types of message content)
 */
export interface MessageItem {
  /** 消息项类型 / Message item type */
  type?: number;
  /** 创建时间（毫秒时间戳）/ Creation time (ms timestamp) */
  create_time_ms?: number;
  /** 更新时间（毫秒时间戳）/ Update time (ms timestamp) */
  update_time_ms?: number;
  /** 是否已完成 / Whether completed */
  is_completed?: boolean;
  /** 消息 ID / Message ID */
  msg_id?: string;
  /** 引用消息 / Referenced message */
  ref_msg?: RefMessage;
  /** 文本消息项 / Text message item */
  text_item?: TextItem;
  /** 图片消息项 / Image message item */
  image_item?: ImageItem;
  /** 语音消息项 / Voice message item */
  voice_item?: VoiceItem;
  /** 文件消息项 / File message item */
  file_item?: FileItem;
  /** 视频消息项 / Video message item */
  video_item?: VideoItem;
}

/**
 * 统一微信消息（proto: WeixinMessage）
 * Unified WeChat message (proto: WeixinMessage)
 *
 * 替代旧的 Message + MessageContent + FullMessage 拆分结构
 * Replaces the old split Message + MessageContent + FullMessage structure
 */
export interface WeixinMessage {
  /** 序列号 / Sequence number */
  seq?: number;
  /** 消息 ID / Message ID */
  message_id?: number;
  /** 发送者用户 ID / Sender user ID */
  from_user_id?: string;
  /** 接收者用户 ID / Receiver user ID */
  to_user_id?: string;
  /** 客户端 ID / Client ID */
  client_id?: string;
  /** 创建时间（毫秒时间戳）/ Creation time (ms timestamp) */
  create_time_ms?: number;
  /** 更新时间（毫秒时间戳）/ Update time (ms timestamp) */
  update_time_ms?: number;
  /** 删除时间（毫秒时间戳）/ Deletion time (ms timestamp) */
  delete_time_ms?: number;
  /** 会话 ID / Session ID */
  session_id?: string;
  /** 群组 ID / Group ID */
  group_id?: string;
  /** 消息类型 / Message type */
  message_type?: number;
  /** 消息状态 / Message state */
  message_state?: number;
  /** 消息项列表 / Message item list */
  item_list?: MessageItem[];
  /** 上下文令牌 / Context token */
  context_token?: string;
}

/**
 * 获取更新请求
 * Get updates request
 *
 * bytes 字段在 JSON 中为 base64 字符串
 * bytes fields are base64 strings in JSON
 */
export interface GetUpdatesReq {
  /** @deprecated 兼容字段，将被移除 / Compat only, will be removed */
  sync_buf?: string;
  /** 完整上下文缓冲（本地缓存）；首次请求或重置后发送空字符串 / Full context buf cached locally; send "" when none */
  get_updates_buf?: string;
}

/**
 * 获取更新响应
 * Get updates response
 *
 * bytes 字段在 JSON 中为 base64 字符串
 * bytes fields are base64 strings in JSON
 */
export interface GetUpdatesResp {
  /** 返回码 / Return code */
  ret?: number;
  /** 错误码（如 -14 = 会话超时）/ Error code (e.g. -14 = session timeout) */
  errcode?: number;
  /** 错误信息 / Error message */
  errmsg?: string;
  /** 消息列表 / Message list */
  msgs?: WeixinMessage[];
  /** @deprecated 兼容字段 / Compat only */
  sync_buf?: string;
  /** 完整上下文缓冲（需本地缓存并在下次请求时发送）/ Full context buf to cache locally and send on next request */
  get_updates_buf?: string;
  /** 服务器建议的下次长轮询超时时间（毫秒）/ Server-suggested timeout (ms) for the next long-poll */
  longpolling_timeout_ms?: number;
}

/**
 * 发送消息请求（包装单条微信消息）
 * Send message request (wraps a single WeixinMessage)
 */
export interface SendMessageReq {
  /** 消息体 / Message body */
  msg?: WeixinMessage;
}

/**
 * 发送消息响应
 * Send message response
 */
export interface SendMessageResp {
  /** 返回码 / Return code */
  ret?: number;
  /** 错误信息 / Error message */
  errmsg?: string;
}

/**
 * 输入状态枚举
 * Typing status enum
 *
 * 1 = 正在输入（默认），2 = 取消输入
 * 1 = typing (default), 2 = cancel typing
 */
export const TypingStatus = {
  /** 正在输入 / Typing */
  TYPING: 1,
  /** 取消输入 / Cancel typing */
  CANCEL: 2,
} as const;

/**
 * 发送输入状态请求
 * Send typing indicator request
 */
export interface SendTypingReq {
  /** iLink 用户 ID / iLink user ID */
  ilink_user_id?: string;
  /** 输入状态票据 / Typing ticket */
  typing_ticket?: string;
  /** 状态：1=正在输入（默认），2=取消输入 / Status: 1=typing (default), 2=cancel typing */
  status?: number;
}

/**
 * 发送输入状态响应
 * Send typing indicator response
 */
export interface SendTypingResp {
  /** 返回码 / Return code */
  ret?: number;
  /** 错误信息 / Error message */
  errmsg?: string;
}

/**
 * 获取配置响应（包含输入状态票据）
 * Get config response (includes typing ticket)
 */
export interface GetConfigResp {
  /** 返回码 / Return code */
  ret?: number;
  /** 错误信息 / Error message */
  errmsg?: string;
  /** Base64 编码的输入状态票据 / Base64-encoded typing ticket for sendTyping */
  typing_ticket?: string;
}

/**
 * 认证接口类型定义
 * Authentication interface type definitions
 *
 * 定义扫码登录流程中使用的所有接口类型
 * Defines all interface types used in the QR code login flow
 */

/**
 * 二维码响应数据
 * QR code response data
 */
export interface QRCodeResponse {
  /** 二维码标识 / QR code identifier */
  qrcode: string;
  /** 二维码图片内容（base64）/ QR code image content (base64) */
  qrcode_img_content: string;
}

/**
 * 扫码状态响应数据
 * QR code scan status response data
 */
export interface StatusResponse {
  /** 扫码状态 / Scan status: wait | scaned | confirmed | expired */
  status: 'wait' | 'scaned' | 'confirmed' | 'expired';
  /** Bot Token（登录成功后返回）/ Bot Token (returned after successful login) */
  bot_token?: string;
  /** iLink Bot ID（登录成功后返回）/ iLink Bot ID (returned after successful login) */
  ilink_bot_id?: string;
  /** API 基础地址 / API base URL */
  baseurl?: string;
  /** 扫码用户 ID / The user ID of the person who scanned the QR code */
  ilink_user_id?: string;
}

/**
 * 事件流配置选项
 * Event stream configuration options
 */
export interface EventStreamOptions {
  /** 轮询间隔时间(ms)，默认 2000 / Polling interval in ms, defaults to 2000 */
  interval?: number;
  /** 超时时间(ms)，默认 300000（5分钟）/ Timeout in ms, defaults to 300000 (5 minutes) */
  timeout?: number;
  /** 二维码标识（用于查询扫码状态）/ QR code identifier (for polling scan status) */
  qrcode?: string;
}

/**
 * 事件流事件类型
 * Event stream event types
 */
export type EventType =
  | 'waiting'    // 等待扫码 / Waiting for scan
  | 'scanned'    // 已扫码 / Scanned
  | 'confirmed'  // 已确认 / Confirmed
  | 'expired'    // 已过期 / Expired
  | 'timeout'    // 超时 / Timeout
  | 'error';     // 错误 / Error

/**
 * 事件流事件
 * Event stream event
 */
export interface WeixinOpenEvent {
  /** 事件类型 / Event type */
  type: EventType;
  /** 事件时间戳 / Event timestamp */
  timestamp: number;
  /** 事件数据（仅在成功时存在）/ Event data (only present on success) */
  data?: StatusResponse;
  /** 错误信息（仅在 type 为 error 时存在）/ Error info (only present when type is 'error') */
  error?: Error;
}

/**
 * 认证响应数据（统一登录流程中的事件格式）
 * Authentication response data (unified event format in login flow)
 */
export interface AuthResponse {
  /** 当前状态 / Current status */
  status: 'wait' | 'scaned' | 'confirmed' | 'expired' | 'qrcode';
  /** 二维码图片 URL（base64）/ QR code image URL (base64) */
  qrcodeUrl: string;
  /** 状态响应数据 / Status response data */
  data?: StatusResponse;
}

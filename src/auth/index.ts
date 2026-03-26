/**
 * 认证模块 - 扫码登录
 * Authentication module - QR code login
 *
 * 提供获取二维码和轮询扫码状态的功能
 * Provides QR code fetching and scan status polling functionality
 */

import { delay } from '../utils/utils';
import type {
  AuthResponse,
  QRCodeResponse,
  StatusResponse,
} from './auth.interface';

/**
 * 获取微信开放平台登录二维码并轮询扫码状态
 * Fetch WeChat Open Platform login QR code and poll scan status
 *
 * 该函数是一个异步生成器，依次产出以下事件：
 * This function is an async generator that yields the following events:
 * 1. qrcode - 二维码已生成 / QR code generated
 * 2. wait - 等待扫码 / Waiting for scan
 * 3. scaned - 已扫码，等待确认 / Scanned, waiting for confirmation
 * 4. confirmed - 登录成功 / Login successful
 * 5. expired - 二维码已过期 / QR code expired
 *
 * @param apiBaseURL - API 基础地址 / API base URL
 * @param botType - 机器人类型 / Bot type
 * @returns 异步生成器，产出认证响应事件 / AsyncGenerator yielding auth response events
 * @throws 二维码获取失败或扫码超时时抛出错误 / Throws on QR code fetch failure or scan timeout
 */
export async function* fetchQRCode(
  apiBaseURL: string,
  botType: string,
): AsyncGenerator<AuthResponse, AuthResponse> {
  // 构建请求 URL / Build request URL
  const base = apiBaseURL.endsWith('/') ? apiBaseURL : `${apiBaseURL}/`;
  const url = new URL(
    `ilink/bot/get_bot_qrcode?bot_type=${encodeURIComponent(botType)}`,
    base,
  );
  const headers: Record<string, string> = {};

  // 请求二维码 / Fetch QR code
  const response = await fetch(url.toString(), { headers });
  if (!response.ok) {
    const body = await response.text().catch(() => '(unreadable)');
    console.log(
      `QR code fetch failed: ${response.status} ${response.statusText} body=${body}`,
    );
    throw new Error(
      `Failed to fetch QR code: ${response.status} ${response.statusText}`,
    );
  }

  // 解析二维码响应（包含 qrcode 标识和 qrcode_img_content 图片内容）
  // Parse QR code response (contains qrcode identifier and qrcode_img_content image data)
  const data = (await response.json()) as QRCodeResponse;

  // 设置超时时间为 480 秒 / Set timeout to 480 seconds
  const timeoutMs = 480_000;
  const deadline = Date.now() + timeoutMs;

  // 产出二维码事件 / Yield QR code event
  yield { status: 'qrcode', qrcodeUrl: data.qrcode_img_content };

  // 轮询扫码状态直到超时 / Poll scan status until timeout
  while (Date.now() < deadline) {
    const status = (await fetchQRCodeStatus(
      apiBaseURL,
      data.qrcode,
    )) as StatusResponse;
    const result = {
      status: status.status,
      data: status,
      qrcodeUrl: data.qrcode_img_content,
    } as AuthResponse;
    yield result;

    // 二维码过期 / QR code expired
    if (result.status === 'expired') {
      throw new Error('QR code scan timeout');
    }
    // 登录成功 / Login successful
    if (result.status === 'confirmed') {
      return result;
    }

    // 等待 1 秒后继续轮询 / Wait 1 second before next poll
    await delay(1000);
  }
  throw new Error('QR code scan timeout');
}

/**
 * 查询二维码扫码状态
 * Query QR code scan status
 *
 * @param apiBaseURL - API 基础地址 / API base URL
 * @param qrcode - 二维码标识 / QR code identifier
 * @returns 扫码状态响应数据 / Scan status response data
 * @throws 请求失败时抛出错误 / Throws on request failure
 */
export async function fetchQRCodeStatus(
  apiBaseURL: string,
  qrcode: string,
): Promise<StatusResponse> {
  // 构建请求 URL / Build request URL
  const base = apiBaseURL.endsWith('/') ? apiBaseURL : `${apiBaseURL}/`;
  const url = new URL(
    `ilink/bot/get_qrcode_status?qrcode=${encodeURIComponent(qrcode)}`,
    base,
  );

  const headers: Record<string, string> = {
    'iLink-App-ClientVersion': '1',
  };
  console.log(`fetchQRCodeStatus: url=${url.toString()}`);

  // 发送请求并解析响应 / Send request and parse response
  const response = await fetch(url.toString(), { headers });
  const rawText = await response.text();
  if (!response.ok) {
    console.log(
      `QR status poll failed: ${response.status} ${response.statusText} body=${rawText}`,
    );
    throw new Error(
      `Failed to poll QR status: ${response.status} ${response.statusText}`,
    );
  }
  return JSON.parse(rawText) as StatusResponse;
}

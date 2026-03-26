# weixin-open-claw 使用文档 / Usage Guide

## 目录 / Table of Contents

- [概述 / Overview](#概述--overview)
- [安装 / Installation](#安装--installation)
- [核心概念 / Core Concepts](#核心概念--core-concepts)
- [扫码登录 / QR Code Login](#扫码登录--qr-code-login)
- [Client 客户端 / Client](#client-客户端--client)
- [发送消息 / Send Messages](#发送消息--send-messages)
- [接收消息 / Receive Messages](#接收消息--receive-messages)
- [文件上传 / File Upload](#文件上传--file-upload)
- [消息解析 / Message Parsing](#消息解析--message-parsing)
- [全局配置 / Global Configuration](#全局配置--global-configuration)
- [加解密工具 / Encryption Utilities](#加解密工具--encryption-utilities)
- [类型定义 / Type Definitions](#类型定义--type-definitions)
- [错误处理 / Error Handling](#错误处理--error-handling)
- [完整示例 / Complete Examples](#完整示例--complete-examples)

---

## 概述 / Overview

`weixin-open-claw` 是一个用于微信开放平台 iLink Bot 开发的 Node.js SDK。它封装了扫码登录、消息收发、文件上传、AES 加解密等核心功能，提供简洁的 TypeScript API。

`weixin-open-claw` is a Node.js SDK for WeChat Open Platform iLink Bot development. It encapsulates core features including QR code login, message send/receive, file upload, and AES encryption/decryption, providing a concise TypeScript API.

### 系统要求 / System Requirements

- Node.js >= 20.0.0
- TypeScript >= 5.0（推荐 / recommended）

---

## 安装 / Installation

```bash
npm install weixin-open-claw
```

---

## 核心概念 / Core Concepts

SDK 的工作流程如下 / SDK workflow:

```
扫码登录 / QR Login → 获取凭证 / Get Credentials (userID, botID, botToken) → 创建 Client / Create Client → 收发消息 / Send & Receive Messages
```

1. **扫码登录 / QR Code Login**：通过 `Client.login()` 获取二维码，用户扫码后获得 `userID`、`botID`、`botToken` / Use `Client.login()` to get QR code, obtain credentials after user scans
2. **创建客户端 / Create Client**：使用凭证创建 `Client` 实例 / Create `Client` instance with credentials
3. **消息收发 / Message Send & Receive**：通过客户端实例发送和接收消息 / Send and receive messages via client instance

---

## 扫码登录 / QR Code Login

### 基本用法 / Basic Usage

```typescript
import { Client } from 'weixin-open-claw';

async function login() {
  const loginFlow = Client.login();

  for await (const event of loginFlow) {
    switch (event.status) {
      case 'qrcode':
        // 首次返回二维码图片内容（base64）
        // First return: QR code image content (base64)
        // 可将 event.qrcodeUrl 渲染为图片供用户扫描
        // Render event.qrcodeUrl as image for user to scan
        console.log('二维码已生成，请扫描 / QR code generated, please scan');
        break;

      case 'wait':
        // 等待用户扫码 / Waiting for user to scan
        console.log('等待扫码... / Waiting for scan...');
        break;

      case 'scaned':
        // 用户已扫码，等待确认 / User scanned, waiting for confirmation
        console.log('已扫码，请在手机上确认 / Scanned, please confirm on phone');
        break;

      case 'confirmed':
        // 登录成功 / Login successful
        const { ilink_user_id, ilink_bot_id, bot_token } = event.data!;
        console.log('登录成功！ / Login successful!');
        console.log('User ID:', ilink_user_id);
        console.log('Bot ID:', ilink_bot_id);
        return { userID: ilink_user_id!, botID: ilink_bot_id!, botToken: bot_token! };

      case 'expired':
        console.log('二维码已过期 / QR code expired');
        throw new Error('QR code expired');
    }
  }
}
```

### 自定义 Bot 类型 / Custom Bot Type

```typescript
// 默认 botType 为 '3'，可自定义 / Default botType is '3', customizable
const loginFlow = Client.login('3');
```

### 登录状态流 / Login Status Flow

```
qrcode → wait → scaned → confirmed
                  ↓
               expired（超时 / timeout）
```

---

## Client 客户端 / Client

### 创建实例 / Create Instance

```typescript
import { Client } from 'weixin-open-claw';

// 方式一：使用静态方法创建 / Method 1: Create via static method
const client = Client.create(userID, botID, botToken);

// 方式二：使用构造函数 / Method 2: Create via constructor
const client = new Client(userID, botID, botToken);
```

### 属性 / Properties

| 属性 / Property | 类型 / Type | 说明 / Description |
|------|------|------|
| `apiBaseURL` | `string` | API 基础地址（可读写）/ API base URL (read/write) |

```typescript
// 获取当前 API 地址 / Get current API URL
console.log(client.apiBaseURL);

// 修改 API 地址 / Modify API URL
client.apiBaseURL = 'https://custom-api.example.com';
```

---

## 发送消息 / Send Messages

### 发送文本消息 / Send Text Message

```typescript
const result = await client.sendMessageByText('你好，世界！ / Hello, World!');
console.log('消息ID / Message ID:', result.messageID);
```

### 发送文件消息 / Send File Message

```typescript
import { UploadMediaType } from 'weixin-open-claw';

// 发送图片（通过文件路径）/ Send image (via file path)
await client.sendMessageByFile('/path/to/image.png', UploadMediaType.IMAGE);

// 发送视频 / Send video
await client.sendMessageByFile('/path/to/video.mp4', UploadMediaType.VIDEO);

// 发送普通文件 / Send general file
await client.sendMessageByFile('/path/to/doc.pdf', UploadMediaType.FILE);

// 通过 Buffer 发送 / Send via Buffer
const imageBuffer = Buffer.from(/* ... */);
await client.sendMessageByFile(imageBuffer, UploadMediaType.IMAGE);

// 通过 File 对象发送（Web API 兼容）/ Send via File object (Web API compatible)
const file = new File([buffer], 'image.png', { type: 'image/png' });
await client.sendMessageByFile(file, UploadMediaType.IMAGE);
```

### UploadMediaType 枚举 / UploadMediaType Enum

| 值 / Value | 常量 / Constant | 说明 / Description |
|----|------|------|
| `1` | `UploadMediaType.IMAGE` | 图片 / Image |
| `2` | `UploadMediaType.VIDEO` | 视频 / Video |
| `3` | `UploadMediaType.FILE` | 文件 / File |
| `4` | `UploadMediaType.VOICE` | 语音 / Voice |

### 发送自定义消息 / Send Custom Message

```typescript
import { MessageType, MessageState, MessageItemType } from 'weixin-open-claw';

await client.sendMessage({
  msg: {
    from_user_id: '',
    to_user_id: userID,
    client_id: 'custom-id-123',
    message_type: MessageType.BOT,
    message_state: MessageState.FINISH,
    item_list: [
      {
        type: MessageItemType.TEXT,
        text_item: { text: '自定义消息内容 / Custom message content' },
      },
    ],
  },
});
```

---

## 接收消息 / Receive Messages

### 长轮询获取消息 / Long Polling for Messages

```typescript
async function listenMessages(client: Client) {
  while (true) {
    try {
      const resp = await client.updateMessage();

      // resp.results 包含解析后的消息列表
      // resp.results contains parsed message list
      if (resp.results) {
        for (const result of resp.results) {
          const parsed = await result;

          if (typeof parsed === 'string') {
            // 文本消息 / Text message
            console.log('文本消息 / Text message:', parsed);
          } else if (typeof parsed === 'object' && 'url' in parsed) {
            // 媒体消息（图片/文件/视频/语音）/ Media message (image/file/video/voice)
            console.log('媒体URL / Media URL:', parsed.url);
            if (parsed.key) {
              console.log('解密密钥 / Decryption key:', parsed.key);
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'session expired') {
        console.log('会话已过期，需要重新登录 / Session expired, re-login required');
        break;
      }
      console.error('获取消息失败 / Failed to get messages:', err);
    }
  }
}
```

### 停止接收 / Stop Receiving

```typescript
// 停止当前长轮询请求 / Stop current long-poll request
client.stop();

// 重置状态（清除偏移量，可重新开始接收）/ Reset state (clear offset, can restart receiving)
client.reset();
```

---

## 文件上传 / File Upload

文件上传流程由 `sendMessageByFile` 内部自动处理，包括：
The file upload flow is handled automatically by `sendMessageByFile`, including:

1. 读取文件并计算 MD5 / Read file and compute MD5
2. 生成 AES 密钥 / Generate AES key
3. 获取上传 URL / Get upload URL
4. AES-128-ECB 加密文件 / Encrypt file with AES-128-ECB
5. 上传加密文件到 CDN / Upload encrypted file to CDN
6. 构造消息并发送 / Build message and send

如需手动控制上传流程，可使用底层 API：
For manual control of the upload flow, use the low-level API:

```typescript
import {
  createFileInfo,
  createUploadURL,
  uploadFileToCND,
} from 'weixin-open-claw/message/message.upload';
```

---

## 消息解析 / Message Parsing

### ParseResult 类型 / ParseResult Type

接收到的消息会被自动解析为以下类型之一：
Received messages are automatically parsed into one of the following types:

| 消息类型 / Message Type | ParseResult | 说明 / Description |
|----------|-------------|------|
| 文本 / Text | `string` | 文本内容 / Text content |
| 图片/文件/视频/语音 / Image/File/Video/Voice | `{ url: string, key?: Buffer }` | CDN 下载地址和解密密钥 / CDN download URL and decryption key |
| 未知 / Unknown | `'未知消息类型'` | 无法识别的消息 / Unrecognized message |

### 下载并解密媒体文件 / Download and Decrypt Media Files

```typescript
import { decryptAesEcb } from 'weixin-open-claw/decrtpt';

const parsed = await result;
if (typeof parsed === 'object' && 'url' in parsed) {
  // 下载加密文件 / Download encrypted file
  const response = await fetch(parsed.url);
  const encrypted = Buffer.from(await response.arrayBuffer());

  // 使用密钥解密 / Decrypt with key
  if (parsed.key) {
    const decrypted = decryptAesEcb(encrypted, parsed.key);
    // decrypted 即为原始文件内容 / decrypted is the original file content
  }
}
```

---

## 全局配置 / Global Configuration

```typescript
import { setConfig } from 'weixin-open-claw';

setConfig({
  // API 基础地址（默认 / default: https://ilinkai.weixin.qq.com）
  base: 'https://custom-api.example.com',

  // CDN 基础地址（默认 / default: https://novac2c.cdn.weixin.qq.com/c2c）
  cdn: 'https://custom-cdn.example.com',

  // Bot 类型（默认 / default: '3'）
  botType: '3',
});
```

> **注意 / Note**：`setConfig` 会影响全局配置，建议在应用启动时调用一次。
> `setConfig` affects global configuration; it's recommended to call it once at app startup.

---

## 加解密工具 / Encryption Utilities

SDK 内置了 AES-128-ECB 加解密工具：
The SDK includes built-in AES-128-ECB encryption/decryption utilities:

```typescript
import { encryptAesEcb, decryptAesEcb, aesEcbPaddedSize } from 'weixin-open-claw/decrtpt';
import crypto from 'node:crypto';

const key = crypto.randomBytes(16);
const plaintext = Buffer.from('Hello, World!');

// 加密 / Encrypt
const ciphertext = encryptAesEcb(plaintext, key);

// 解密 / Decrypt
const decrypted = decryptAesEcb(ciphertext, key);

// 计算加密后大小（PKCS7 填充）/ Calculate encrypted size (PKCS7 padding)
const paddedSize = aesEcbPaddedSize(plaintext.length); // 16
```

---

## 类型定义 / Type Definitions

### 消息相关类型 / Message Related Types

```typescript
// 消息类型 / Message type
const MessageType = { NONE: 0, USER: 1, BOT: 2 } as const;

// 消息项类型 / Message item type
const MessageItemType = { NONE: 0, TEXT: 1, IMAGE: 2, VOICE: 3, FILE: 4, VIDEO: 5 } as const;

// 消息状态 / Message state
const MessageState = { NEW: 0, GENERATING: 1, FINISH: 2 } as const;

// 上传媒体类型 / Upload media type
const UploadMediaType = { IMAGE: 1, VIDEO: 2, FILE: 3, VOICE: 4 } as const;
```

### 核心接口 / Core Interfaces

```typescript
// 微信消息 / WeChat message
interface WeixinMessage {
  seq?: number;
  message_id?: number;
  from_user_id?: string;
  to_user_id?: string;
  client_id?: string;
  create_time_ms?: number;
  update_time_ms?: number;
  message_type?: number;
  message_state?: number;
  item_list?: MessageItem[];
  context_token?: string;
}

// 消息项 / Message item
interface MessageItem {
  type?: number;
  text_item?: TextItem;
  image_item?: ImageItem;
  voice_item?: VoiceItem;
  file_item?: FileItem;
  video_item?: VideoItem;
}

// 发送消息请求 / Send message request
interface SendMessageReq {
  msg?: WeixinMessage;
}

// 获取更新响应 / Get updates response
interface GetUpdatesResp {
  ret?: number;
  errcode?: number;
  errmsg?: string;
  msgs?: WeixinMessage[];
  get_updates_buf?: string;
}
```

---

## 错误处理 / Error Handling

### 会话过期 / Session Expired

当服务端返回错误码 `-14` 时，SDK 会抛出 `session expired` 错误：
When the server returns error code `-14`, the SDK throws a `session expired` error:

```typescript
try {
  await client.updateMessage();
} catch (err) {
  if (err instanceof Error && err.message === 'session expired') {
    // 需要重新扫码登录 / Need to re-login via QR code
  }
}
```

### 二维码超时 / QR Code Timeout

扫码登录超时（默认 480 秒）会抛出错误：
QR code login timeout (default 480 seconds) throws an error:

```typescript
try {
  for await (const event of Client.login()) {
    // ...
  }
} catch (err) {
  if (err instanceof Error && err.message === 'QR code scan timeout') {
    // 二维码已过期，需要重新获取 / QR code expired, need to re-fetch
  }
}
```

### CDN 上传错误 / CDN Upload Errors

文件上传失败会抛出详细的错误信息：
File upload failures throw detailed error messages:

```typescript
try {
  await client.sendMessageByFile('/path/to/file.pdf');
} catch (err) {
  // CDN upload client error 4xx: ...
  // CDN upload server error: ...
  // CDN upload response missing x-encrypted-param header
}
```

---

## 完整示例 / Complete Examples

### 回声机器人 / Echo Bot

```typescript
import { Client } from 'weixin-open-claw';

async function main() {
  // 1. 扫码登录 / QR code login
  let userID: string, botID: string, botToken: string;

  const loginFlow = Client.login();
  for await (const event of loginFlow) {
    if (event.status === 'qrcode') {
      // 在终端中可以将 base64 转为图片展示
      // In terminal, convert base64 to image for display
      console.log('请扫描二维码登录 / Please scan QR code to login');
      // 可以将 event.qrcodeUrl 保存为图片文件
      // Save event.qrcodeUrl as image file
    }
    if (event.status === 'confirmed') {
      userID = event.data!.ilink_user_id!;
      botID = event.data!.ilink_bot_id!;
      botToken = event.data!.bot_token!;
      console.log('登录成功！ / Login successful!');
      break;
    }
  }

  // 2. 创建客户端 / Create client
  const client = Client.create(userID!, botID!, botToken!);

  // 3. 监听并回复消息 / Listen and reply to messages
  console.log('Echo Bot 已启动，等待消息... / Echo Bot started, waiting for messages...');

  while (true) {
    try {
      const resp = await client.updateMessage();
      if (resp.results) {
        for (const result of resp.results) {
          const parsed = await result;
          if (typeof parsed === 'string' && parsed.trim()) {
            // 回声：将收到的文本消息原样发回 / Echo: send back the received text message
            await client.sendMessageByText(`Echo: ${parsed}`);
            console.log(`回复 / Reply: Echo: ${parsed}`);
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'session expired') {
        console.log('会话已过期，退出 / Session expired, exiting');
        break;
      }
      console.error('错误 / Error:', err);
    }
  }
}

main().catch(console.error);
```

### 图片转发机器人 / Image Forwarding Bot

```typescript
import { Client, UploadMediaType } from 'weixin-open-claw';
import { decryptAesEcb } from 'weixin-open-claw/decrtpt';
import fs from 'node:fs/promises';

/**
 * 处理媒体消息（下载、解密、保存、转发）
 * Handle media message (download, decrypt, save, forward)
 */
async function handleMediaMessage(
  client: InstanceType<typeof Client>,
  parsed: { url: string; key?: Buffer },
) {
  // 下载加密文件 / Download encrypted file
  const response = await fetch(parsed.url);
  const encrypted = Buffer.from(await response.arrayBuffer());

  // 解密 / Decrypt
  let fileData: Buffer;
  if (parsed.key) {
    fileData = decryptAesEcb(encrypted, parsed.key);
  } else {
    fileData = encrypted;
  }

  // 保存到本地 / Save to local
  const filePath = `/tmp/received_${Date.now()}.bin`;
  await fs.writeFile(filePath, fileData);
  console.log(`文件已保存 / File saved: ${filePath}`);

  // 转发回去 / Forward back
  await client.sendMessageByFile(fileData, UploadMediaType.IMAGE);
}
```

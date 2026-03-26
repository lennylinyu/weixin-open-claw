# weixin-open-claw

[![npm version](https://img.shields.io/npm/v/weixin-open-claw.svg)](https://www.npmjs.com/package/weixin-open-claw)
[![license](https://img.shields.io/npm/l/weixin-open-claw.svg)](https://github.com/user/weixin-open-claw/blob/main/LICENSE)

> 微信开放平台 iLink Bot Node.js SDK —— 简洁、类型安全、开箱即用。
>
> WeChat Open Platform iLink Bot Node.js SDK — concise, type-safe, and ready to use.

## ✨ 特性 / Features

- 🔒 **TypeScript 优先 / TypeScript First** —— 完整的类型定义，享受 IDE 智能提示 / Full type definitions with IDE IntelliSense
- 📦 **双模块支持 / Dual Module Support** —— 同时提供 ESM 和 CJS 格式 / Provides both ESM and CJS formats
- 🚀 **Node.js 20+** —— 面向现代 Node.js 运行时 / Built for modern Node.js runtime
- 🤖 **扫码登录 / QR Code Login** —— 支持二维码扫码登录获取 Bot Token / QR code scan login to obtain Bot Token
- 💬 **消息收发 / Message Send & Receive** —— 支持文本、图片、文件、视频等多种消息类型 / Supports text, image, file, video and more
- 🔐 **AES 加解密 / AES Encryption** —— 内置 AES-128-ECB 加解密，自动处理文件上传加密 / Built-in AES-128-ECB encryption for file uploads

## 📦 安装 / Installation

```bash
# npm
npm install weixin-open-claw

# yarn
yarn add weixin-open-claw

# pnpm
pnpm add weixin-open-claw
```

## 🚀 快速开始 / Quick Start

### 1. 扫码登录 / QR Code Login

```typescript
import { Client } from 'weixin-open-claw';

// 发起扫码登录 / Initiate QR code login
const loginFlow = Client.login();

for await (const event of loginFlow) {
  if (event.status === 'qrcode') {
    // event.qrcodeUrl 为二维码图片的 base64 内容，可用于展示
    // event.qrcodeUrl is the base64 content of the QR code image
    console.log('请扫描二维码登录 / Please scan the QR code to login');
  }
  if (event.status === 'scaned') {
    console.log('已扫码，等待确认... / Scanned, waiting for confirmation...');
  }
  if (event.status === 'confirmed') {
    // 登录成功，获取 bot 信息 / Login successful, get bot info
    const { ilink_user_id, ilink_bot_id, bot_token } = event.data!;
    console.log('登录成功！ / Login successful!');

    // 使用获取到的信息创建客户端 / Create client with obtained credentials
    const client = Client.create(ilink_user_id!, ilink_bot_id!, bot_token!);
    break;
  }
}
```

### 2. 发送文本消息 / Send Text Message

```typescript
const client = Client.create(userID, botID, botToken);

// 发送文本消息 / Send text message
await client.sendMessageByText('你好，世界！ / Hello, World!');
```

### 3. 发送文件/图片/视频 / Send File/Image/Video

```typescript
import { UploadMediaType } from 'weixin-open-claw';

// 发送图片 / Send image
await client.sendMessageByFile('/path/to/image.png', UploadMediaType.IMAGE);

// 发送视频 / Send video
await client.sendMessageByFile('/path/to/video.mp4', UploadMediaType.VIDEO);

// 发送文件 / Send file
await client.sendMessageByFile('/path/to/document.pdf', UploadMediaType.FILE);

// 也支持 Buffer / Also supports Buffer
const buffer = Buffer.from('...');
await client.sendMessageByFile(buffer, UploadMediaType.FILE);
```

### 4. 接收消息（长轮询）/ Receive Messages (Long Polling)

```typescript
const client = Client.create(userID, botID, botToken);

while (true) {
  try {
    const resp = await client.updateMessage();
    if (resp.results) {
      for (const result of resp.results) {
        const parsed = await result;
        console.log('收到消息 / Received message:', parsed);
      }
    }
  } catch (err) {
    if (err instanceof Error && err.message === 'session expired') {
      console.log('会话已过期，需要重新登录 / Session expired, re-login required');
      break;
    }
  }
}

// 停止接收消息 / Stop receiving messages
client.stop();
```

### 5. 自定义配置 / Custom Configuration

```typescript
import { setConfig } from 'weixin-open-claw';

// 自定义 API 基础地址、CDN 地址等 / Customize API base URL, CDN URL, etc.
setConfig({
  base: 'https://your-custom-api.example.com',
  cdn: 'https://your-custom-cdn.example.com',
  botType: '3',
});
```

## 📖 API 参考 / API Reference

详细的 API 文档请参阅 [使用文档 / Usage Guide](./docs/USAGE.md)。

### 导出内容 / Exports

| 导出 / Export | 类型 / Type | 说明 / Description |
|------|------|------|
| `Client` | `class` | 核心客户端类，用于消息收发 / Core client class for message send & receive |
| `setConfig` | `function` | 全局配置函数 / Global configuration function |

### Client 类 / Client Class

#### 静态方法 / Static Methods

| 方法 / Method | 说明 / Description |
|------|------|
| `Client.login(botType?)` | 发起扫码登录，返回 `AsyncGenerator` / Initiate QR login, returns `AsyncGenerator` |
| `Client.create(userID, botID, botToken)` | 创建客户端实例 / Create client instance |

#### 实例方法 / Instance Methods

| 方法 / Method | 说明 / Description |
|------|------|
| `sendMessageByText(text)` | 发送文本消息 / Send text message |
| `sendMessageByFile(file, fileType?)` | 发送文件/图片/视频消息 / Send file/image/video message |
| `sendMessage(message)` | 发送自定义消息 / Send custom message |
| `updateMessage()` | 长轮询获取新消息 / Long-poll for new messages |
| `stop()` | 停止当前长轮询 / Stop current long-poll |
| `reset()` | 重置偏移量和停止状态 / Reset offset and stop state |

## 🛠 开发 / Development

```bash
# 安装依赖 / Install dependencies
npm install

# 开发模式（监听文件变化）/ Dev mode (watch file changes)
npm run dev

# 构建 / Build
npm run build

# 运行测试 / Run tests
npm test

# 测试覆盖率 / Test coverage
npm run test:coverage

# 类型检查 / Type check
npm run typecheck

# 代码格式化 / Code formatting
npm run format
```

## 🙏 致谢 / Acknowledgements

本项目参考并借鉴了 [@tencent-weixin/openclaw-weixin-cli](https://www.npmjs.com/package/@tencent-weixin/openclaw-weixin-cli)，感谢原项目的开源贡献。

This project is inspired by and references [@tencent-weixin/openclaw-weixin-cli](https://www.npmjs.com/package/@tencent-weixin/openclaw-weixin-cli). Thanks for the open-source contribution of the original project.

## 📄 许可证 / License

[MIT](LICENSE) © weixin-open-claw contributors

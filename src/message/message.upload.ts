/**
 * 文件上传模块
 * File upload module
 *
 * 提供文件读取、信息提取、上传 URL 获取、CDN 上传等功能
 * Provides file reading, info extraction, upload URL fetching, and CDN upload functionality
 */

import fs from "node:fs/promises";
import { GetUploadUrlResp, UploadMediaType } from "../types";
import { createHeader, createMD5 } from "../utils/utils";
import { aesEcbPaddedSize, encryptAesEcb } from "../decrtpt";
import crypto from "node:crypto";
import { buildBaseInfo } from "../config";
import path from "node:path";

/**
 * 上传文件到微信（预留接口，待实现）
 * Upload file to WeChat (reserved interface, to be implemented)
 *
 * @param _options - 上传选项 / Upload options
 * @param _options.userID - 用户 ID / User ID
 * @param _options.filePath - 文件路径、File 对象或 Buffer / File path, File object, or Buffer
 * @param _options.mediaType - 媒体类型 / Media type
 * @param _options.token - Bot Token / Bot Token
 */
export async function uploadFileToWeiXin(_options: {
    userID: string,
    filePath: File | string | Buffer,
    mediaType: (typeof UploadMediaType)[keyof typeof UploadMediaType],
    token: string
}) {
    // TODO: 实现上传逻辑 / implement upload logic
}

/**
 * 检查文件是否可访问
 * Check if a file is accessible
 *
 * @param filePath - 文件路径 / File path
 * @returns 文件是否可访问 / Whether the file is accessible
 */
export function access(filePath: string) {
    try {
        fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

/**
 * 读取文件内容
 * Read file content
 *
 * @param filePath - 文件路径 / File path
 * @returns 文件内容 Buffer / File content Buffer
 * @throws 文件不存在时抛出错误 / Throws when file does not exist
 */
export async function readFile(filePath: string) {
    const fileExists = await access(filePath);
    if (!fileExists) {
        throw new Error(`File not found: ${filePath}`);
    }
    return await fs.readFile(filePath);
}

/**
 * 文件上传信息类型
 * File upload info type
 *
 * 包含文件的原始数据、加密信息、CDN 地址等
 * Contains file raw data, encryption info, CDN URLs, etc.
 */
export type FileUploadInfo = {
    /** 文件内容 Buffer / File content Buffer */
    buffer: Buffer,
    /** 文件 MD5 哈希 / File MD5 hash */
    md5: string,
    /** 加密后的文件大小（字节）/ Encrypted file size in bytes */
    filesize: number,
    /** 原始文件大小（字节）/ Original file size in bytes */
    size: number,
    /** 文件密钥（16 字节随机）/ File key (16 random bytes) */
    filekey: Buffer,
    /** AES 加密密钥（16 字节随机）/ AES encryption key (16 random bytes) */
    aeskey: Buffer,
    /** CDN 上传 URL / CDN upload URL */
    cdnURL?: string,
    /** 媒体类型 / Media type */
    mediaType: (typeof UploadMediaType)[keyof typeof UploadMediaType],
    /** CDN 下载 URL / CDN download URL */
    downdownURL?: string,
    /** 文件名 / File name */
    fileName?: string
}

/**
 * 创建文件上传信息（读取文件、计算 MD5、生成密钥）
 * Create file upload info (read file, compute MD5, generate keys)
 *
 * 支持文件路径（string）、File 对象和 Buffer 三种输入
 * Supports file path (string), File object, and Buffer as input
 *
 * @param filePath - 文件路径、File 对象或 Buffer / File path, File object, or Buffer
 * @param mediaType - 媒体类型，默认为 FILE / Media type, defaults to FILE
 * @returns 文件上传信息 / File upload info
 * @throws 文件不存在或输入无效时抛出错误 / Throws when file not found or input is invalid
 */
export async function createFileInfo(filePath: string | Buffer | File, mediaType: (typeof UploadMediaType)[keyof typeof UploadMediaType] = UploadMediaType.FILE): Promise<FileUploadInfo> {
    let fileBuffer: Buffer | undefined;
    let fileName: string | undefined;

    // 根据输入类型读取文件 / Read file based on input type
    if (typeof filePath === 'string') {
        const fileExists = await access(filePath);
        if (!fileExists) {
            throw new Error(`File not found: ${filePath}`);
        }
        fileName = path.basename(filePath);
        fileBuffer = await fs.readFile(filePath);
    } else if (filePath instanceof File) {
        fileBuffer = Buffer.from(await filePath.arrayBuffer());
    } else if (filePath instanceof Buffer) {
        fileBuffer = filePath;
    }

    if (!fileBuffer) {
        throw new Error(`Invalid file path: ${filePath}`);
    }

    // 计算文件信息 / Calculate file info
    const md5 = createMD5(fileBuffer);
    const size = fileBuffer.length;
    const filesize = aesEcbPaddedSize(size);
    // 生成随机密钥 / Generate random keys
    const filekey = crypto.randomBytes(16)
    const aeskey = crypto.randomBytes(16)

    return {fileName, buffer: fileBuffer, md5, filesize, size, filekey, aeskey, mediaType: mediaType };
}


/**
 * 获取文件上传 URL
 * Get file upload URL
 *
 * 向微信服务器请求获取 CDN 上传地址
 * Request CDN upload URL from WeChat server
 *
 * @param options - 请求选项 / Request options
 * @param options.baseUrl - API 基础地址 / API base URL
 * @param options.token - Bot Token / Bot Token
 * @param options.fileInfo - 文件上传信息 / File upload info
 * @param options.userID - 目标用户 ID / Target user ID
 * @returns 上传 URL 响应 / Upload URL response
 */
export function createUploadURL(options: { baseUrl: string, token: string, fileInfo: FileUploadInfo, userID: string }) {
    const { baseUrl, token, fileInfo, userID } = options;

    // 构建请求 URL / Build request URL
    const base = baseUrl.endsWith('/')
        ? baseUrl
        : `${baseUrl}/`;
    const url = new URL("ilink/bot/getuploadurl", base);

    return fetch(url, {
        headers: createHeader(token),
        method: 'POST',
        body: JSON.stringify({
            filekey: fileInfo.filekey.toString('hex'),
            media_type: fileInfo.mediaType,
            to_user_id: userID,
            rawsize: fileInfo.size,
            rawfilemd5: fileInfo.md5,
            filesize: fileInfo.filesize,
            // 未作处理-预览图片 / Not implemented - thumbnail
            thumb_rawsize: undefined,
            // 未作处理-预览图片 / Not implemented - thumbnail
            thumb_rawfilemd5: undefined,
            // 未作处理-预览图片 / Not implemented - thumbnail
            thumb_filesize: undefined,
            // 不需要预览图片 / No thumbnail needed
            no_need_thumb: true,
            aeskey: fileInfo.aeskey.toString('hex'),
            base_info: buildBaseInfo(),
        }),
    }).then((res) => res.json() as unknown as GetUploadUrlResp);
}

/**
 * 上传加密文件到 CDN
 * Upload encrypted file to CDN
 *
 * 将文件使用 AES-128-ECB 加密后上传到微信 CDN
 * Encrypts file with AES-128-ECB and uploads to WeChat CDN
 *
 * @param options - 上传选项 / Upload options
 * @param options.baseUrl - CDN 基础地址 / CDN base URL
 * @param options.info - 文件上传信息 / File upload info
 * @returns CDN 返回的加密参数（用于后续下载）/ Encrypted param from CDN (for subsequent download)
 * @throws 上传失败或响应缺少必要头时抛出错误 / Throws on upload failure or missing response header
 */
export async function uploadFileToCND(options: { baseUrl: string, info: FileUploadInfo }) {
    const { baseUrl, info } = options;
    // 构建 CDN 上传 URL / Build CDN upload URL
    const cdnUrl = `${baseUrl}/upload?encrypted_query_param=${encodeURIComponent(info.cdnURL ?? '')}&filekey=${encodeURIComponent(info.filekey.toString('hex'))}`;

    // AES-128-ECB 加密文件 / Encrypt file with AES-128-ECB
    const ciphertext = encryptAesEcb(info.buffer, info.aeskey);

    const res = await fetch(cdnUrl, {
        headers: { "Content-Type": "application/octet-stream" },
        method: 'POST',
        body: new Uint8Array(ciphertext),
    });

    // 检查客户端错误 (4xx) / Check client errors (4xx)
    if (res.status >= 400 && res.status < 500) {
        const errMsg = res.headers.get("x-error-message") ?? (await res.text());
        throw new Error(`CDN upload client error ${res.status}: ${errMsg}`);
    }

    // 检查服务端错误 (非200) / Check server errors (non-200)
    if (res.status !== 200) {
        const errMsg = res.headers.get("x-error-message") ?? `status ${res.status}`;
        throw new Error(`CDN upload server error: ${errMsg}`);
    }

    // 从响应头获取加密参数 / Get encrypted param from response header
    const result = res.headers.get("x-encrypted-param");
    if (!result) {
        throw new Error('CDN upload response missing x-encrypted-param header');
    }
    return result;
}
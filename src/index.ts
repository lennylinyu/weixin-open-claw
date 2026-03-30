/**
 * weixin-open-claw SDK 入口文件
 * Entry point for weixin-open-claw SDK
 *
 * 导出核心客户端类和全局配置函数
 * Exports the core Client class and global configuration function
 */
import Client from './client/Client';
import { setConfig } from './config';

export { Client, setConfig };

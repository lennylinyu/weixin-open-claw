/**
 * Vitest 测试配置
 * Vitest test configuration
 *
 * 配置测试环境、文件匹配规则和覆盖率报告
 * Configures test environment, file matching rules, and coverage reporting
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 启用全局测试 API（describe, it, expect 等）/ Enable global test APIs (describe, it, expect, etc.)
    globals: true,
    // 使用 Node.js 测试环境 / Use Node.js test environment
    environment: 'node',
    // 测试文件匹配规则 / Test file matching pattern
    include: ['tests/**/*.test.ts'],
    // 覆盖率配置 / Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // 覆盖率统计范围 / Coverage scope
      include: ['src/**/*.ts'],
      // 排除类型声明文件 / Exclude type declaration files
      exclude: ['src/**/*.d.ts'],
    },
  },
});

/**
 * Rollup 构建配置
 * Rollup build configuration
 *
 * 输出三种格式：ESM、CJS 和类型声明文件
 * Outputs three formats: ESM, CJS, and type declaration files
 */

import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import dts from 'rollup-plugin-dts';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

// 外部依赖不打包 / External dependencies are not bundled
const external = [
  ...Object.keys(pkg.devDependencies || {}),
];

export default defineConfig([
  // ESM 输出 / ESM output
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist/esm',
      format: 'esm',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    external,
    plugins: [
      resolve(),
      commonjs(),
      json(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationDir: undefined,
        outDir: 'dist/esm',
      }),
    ],
  },
  // CJS 输出 / CJS output
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist/cjs',
      format: 'cjs',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src',
      exports: 'named',
      entryFileNames: '[name].cjs',
    },
    external,
    plugins: [
      resolve(),
      commonjs(),
      json(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationDir: undefined,
        outDir: 'dist/cjs',
      }),
    ],
  },
  // 类型声明文件输出 / Type declaration file output
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/types/index.d.ts',
      format: 'esm',
    },
    plugins: [dts()],
  },
]);

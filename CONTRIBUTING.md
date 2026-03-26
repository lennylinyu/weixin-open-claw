# 贡献指南

感谢您对本项目的关注！以下是参与贡献的指南。

## 行为准则

请阅读并遵守我们的 [行为准则](CODE_OF_CONDUCT.md)。

## 如何贡献

### 报告 Bug

- 使用 GitHub Issues 报告 bug
- 请使用 Bug 报告模板
- 描述清楚复现步骤

### 提交功能建议

- 使用 GitHub Issues 提交功能建议
- 请使用功能请求模板
- 描述清楚使用场景

### 提交代码

1. Fork 并 clone 仓库
2. 安装依赖：`npm install`
3. 创建功能分支：`git checkout -b feature/my-feature`
4. 编写代码和测试
5. 确保所有测试通过：`npm test`
6. 确保类型检查通过：`npm run typecheck`
7. 提交更改，遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范
8. 推送并创建 Pull Request

### Commit 规范

本项目遵循 Conventional Commits 规范：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式（不影响功能）
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建/工具相关

### 开发流程

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 运行测试
npm test

# 构建
npm run build
```

## 发布流程

仅限维护者操作：

1. 更新版本号：`npm version <major|minor|patch>`
2. 推送 tag：`git push --follow-tags`
3. GitHub Actions 将自动发布到 npm

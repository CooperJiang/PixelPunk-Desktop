# Git Commit 规范

本项目使用 emoji + 类型 + 描述 的格式编写 commit message。

## Commit 格式

```
<emoji> <type>: <description>
```

## Emoji 与类型对照表

| Emoji | 类型 | 说明 | 示例 |
|-------|------|------|------|
| ✨ | feat | 新功能 | ✨ feat: add user login functionality |
| 🐛 | fix | 修复bug | 🐛 fix: resolve window state restoration error |
| 📝 | docs | 文档更新 | 📝 docs: update README with setup instructions |
| 💄 | style | 样式调整（UI/CSS） | 💄 style: improve button hover effects |
| ♻️ | refactor | 代码重构 | ♻️ refactor: simplify window management logic |
| ⚡️ | perf | 性能优化 | ⚡️ perf: optimize state save with debounce |
| ✅ | test | 测试相关 | ✅ test: add unit tests for auth service |
| 🔧 | chore | 构建/工具/依赖 | 🔧 chore: update tauri dependencies |
| 🎉 | init | 项目初始化 | 🎉 init: initialize project structure |
| 🔒 | security | 安全相关 | 🔒 security: add token encryption |
| 🌐 | i18n | 国际化 | 🌐 i18n: add English translations |
| 🚀 | deploy | 部署相关 | 🚀 deploy: configure CI/CD pipeline |

## 示例

```bash
# 新功能
git commit -m "✨ feat: add close to tray with quitOnClose config"

# 修复bug
git commit -m "🐛 fix: resolve permissions and lifecycle warnings"

# 文档更新
git commit -m "📝 docs: add test page guide and remove unused file"

# 重构
git commit -m "♻️ refactor: reorganize documentation structure"

# 工具配置
git commit -m "🔧 chore: update vite config for production build"
```

## 注意事项

1. **简洁明了**：每个 commit 只包含一个主要变更
2. **使用英文**：描述部分使用英文（可选中文）
3. **动词开头**：使用动词原形开头（add, fix, update, remove 等）
4. **小写字母**：描述部分使用小写字母开头
5. **不加句号**：结尾不需要句号

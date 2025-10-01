# 贡献指南

感谢你考虑为 PixelPunk 做出贡献！

## 行为准则

参与此项目即表示你同意遵守我们的行为准则。请保持友好、尊重和包容的态度。

## 如何贡献

### 报告问题

如果你发现了 bug 或有功能建议：

1. 先搜索 [Issues](https://github.com/yourusername/pixelpunk/issues) 确认问题尚未被报告
2. 创建新 Issue，使用清晰的标题和详细的描述
3. 包含复现步骤、预期行为和实际行为
4. 提供环境信息（操作系统、Node.js 版本、Rust 版本等）

### 提交代码

#### 准备工作

1. Fork 本仓库
2. 克隆你的 fork：
   ```bash
   git clone https://github.com/your-username/pixelpunk.git
   cd pixelpunk
   ```
3. 安装依赖：
   ```bash
   npm install
   ```
4. 创建新分支：
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

#### 开发流程

1. **编写代码**
   - 遵循项目现有的代码风格
   - 保持代码简洁、可读
   - 添加必要的注释

2. **测试你的更改**

   ```bash
   npm run tauri:dev
   ```

3. **代码检查**

   ```bash
   npm run lint
   npm run type-check
   ```

4. **格式化代码**

   ```bash
   npm run format
   ```

5. **提交更改**
   ```bash
   git add .
   git commit -m "描述你的更改"
   ```

#### 提交信息规范

使用清晰、简洁的提交信息：

- `feat: 添加悬浮球配置选项`
- `fix: 修复 macOS 窗口透明问题`
- `docs: 更新 README 文档`
- `style: 格式化代码`
- `refactor: 重构配置加载逻辑`
- `test: 添加单元测试`
- `chore: 更新依赖版本`

#### 推送并创建 Pull Request

1. 推送到你的 fork：

   ```bash
   git push origin feature/your-feature-name
   ```

2. 在 GitHub 上创建 Pull Request：
   - 提供清晰的标题和描述
   - 说明更改的动机和实现方法
   - 引用相关的 Issue（如果有）
   - 附上截图或 GIF（如果涉及 UI 更改）

3. 等待代码审查：
   - 及时回应审查意见
   - 根据反馈进行修改
   - 保持 PR 与主分支同步

## 开发指南

### 项目结构

```
pixelpunk/
├── src/              # Vue 前端代码
├── src-tauri/        # Rust 后端代码
├── scripts/          # 构建脚本
└── public/           # 静态资源
```

### 代码风格

#### TypeScript/Vue

- 使用 TypeScript 严格模式
- 优先使用 Composition API
- 组件使用 `<script setup>` 语法
- 使用 2 空格缩进
- 使用单引号
- 添加类型注解

#### Rust

- 遵循 Rust 标准代码风格
- 使用 `cargo fmt` 格式化代码
- 添加文档注释
- 处理所有错误情况

### 添加新功能

#### 1. 添加 Tauri 命令

```rust
// src-tauri/src/commands.rs
/// 命令功能说明
#[tauri::command]
pub fn my_command(param: String) -> Result<String, String> {
    // 实现逻辑
    Ok(result)
}
```

在 `lib.rs` 中注册：

```rust
.invoke_handler(tauri::generate_handler![
    commands::my_command,
])
```

#### 2. 添加事件监听

```typescript
// 定义类型
export interface MyEventPayload {
  data: string;
}

// 监听事件
import { listen } from "@tauri-apps/api/event";

const unlisten = await listen<MyEventPayload>("my-event", (event) => {
  console.log(event.payload.data);
});
```

#### 3. 添加配置项

在 `src/config/app.config.ts` 中添加配置：

```typescript
export const appConfig = {
  // ... 现有配置
  myFeature: {
    enabled: true,
    option: "value",
  },
};
```

### 测试

目前项目暂无自动化测试。手动测试时请确保：

- 在 macOS/Windows/Linux 上测试（如果可能）
- 测试主要功能路径
- 测试边界情况和错误处理
- 检查性能影响

### 文档

- 更新 README.md（如果添加新功能）
- 更新 CHANGELOG.md
- 添加代码注释
- 更新类型定义

## 常见问题

### Q: 如何同步 upstream？

```bash
git remote add upstream https://github.com/original-owner/pixelpunk.git
git fetch upstream
git merge upstream/main
```

### Q: 我的 PR 应该包含多少更改？

保持 PR 小而专注。一个 PR 应该解决一个问题或添加一个功能。

### Q: 如何处理合并冲突？

```bash
git fetch upstream
git merge upstream/main
# 解决冲突
git add .
git commit
git push origin your-branch
```

## 需要帮助？

- 📖 查看 [README.md](README.md)
- 💬 在 [Discussions](https://github.com/yourusername/pixelpunk/discussions) 提问
- 🐛 在 [Issues](https://github.com/yourusername/pixelpunk/issues) 报告问题

## 许可证

贡献的代码将采用与项目相同的 [MIT License](LICENSE)。

---

感谢你的贡献！❤️

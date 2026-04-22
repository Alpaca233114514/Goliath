# Goliath
# 预置README，现有程序无实际功能

> AI Agent Sidebar for Obsidian. Bring your own AI.

Goliath 是一个通用的 Obsidian 侧边栏插件，让你在笔记应用内直接与多种 AI Agent 对话，并让它们读取、理解甚至编辑你的 Vault 内容。

## 特性

- **多 Agent 架构**：支持 Claude Code (CLI)、Anthropic API、OpenAI API、OpenAI-Compatible (Ollama / vLLM / LM Studio 等)
- **Vault 原生集成**：AI 自动读取当前打开的笔记作为上下文，支持 `@笔记名` 手动引用
- **Vault CRUD**：AI 可执行读、写、创建、重命名文件操作（删除需确认）
- **消息持久化**：会话自动保存，Obsidian 重启后可恢复
- **完整 Markdown 渲染**：支持代码块、表格、LaTeX 公式（依赖 Obsidian 原生 MathJax）
- **流式输出**：实时显示 AI 回复，无需等待整段生成
- **主题自适应**：完全使用 Obsidian CSS 变量，暗色/亮色模式无缝切换

## 安装

> ⚠️ 本插件尚未上架 Obsidian 社区插件市场，目前仅支持手动安装。

### 手动安装

1. 下载最新 Release 中的 `main.js`、`manifest.json`、`styles.css`
2. 在你的 Vault 目录下创建文件夹：`<vault>/.obsidian/plugins/goliath/`
3. 将三个文件复制到该文件夹
4. 重启 Obsidian
5. 进入 `设置 → 社区插件`，关闭安全模式
6. 找到 **Goliath** 并启用

### 通过 BRAT 安装（Beta）

1. 安装 [BRAT](https://github.com/TfTHacker/obsidian42-brat) 插件
2. `Ctrl/Cmd+P` → `BRAT: Add a beta plugin for testing`
3. 输入：`https://github.com/Alpaca233114514/Goliath`

## 配置

进入 `设置 → Goliath`：

### Claude Code (CLI)
- **模式**：CLI
- **路径**：`claude` 或绝对路径（如 `/opt/homebrew/bin/claude`）
- **YOLO 模式**：跳过 CLI 的交互式权限确认（`--dangerously-skip-permissions`）

### Anthropic / OpenAI / OpenAI-Compatible (API)
- **模式**：API
- **API Key**：在插件设置中填写，或从环境变量读取
- **模型**：支持模型列表自动获取
- **Base URL**：OpenAI-Compatible 必填（如 `http://localhost:11434/v1`）

## 使用

- **打开侧边栏**：点击左侧 Ribbon 图标，或使用命令面板 `Ctrl/Cmd+P` → `Open Goliath`
- **发送消息**：`Enter` 发送，`Shift+Enter` 换行
- **切换 Agent**：侧边栏底部标签栏点击切换
- **引用笔记**：输入框中使用 `@笔记名` 手动附加上下文

## 隐私与安全

- **数据外发**：使用 API 模式时，你的消息和笔记内容会发送至对应的 AI 服务商（Anthropic / OpenAI / 你的本地服务器）。请勿在对话中发送敏感或机密信息。
- **文件安全**：所有 Vault 文件操作均限制在 Vault 根目录内，禁止目录遍历。删除操作始终需要你的手动确认。
- **CLI 模式**：YOLO 模式会禁用 AI 工具的交互式确认，请仅在可信环境下开启。

## 开发

```bash
git clone https://github.com/Alpaca233114514/Goliath.git
cd Goliath
npm install
npm run dev      # 热重载
npm run build    # 生产构建
```

## 路线图

- [x] MVP：Claude Code CLI 支持 + 流式聊天
- [ ] 多 Agent 切换与设置面板
- [ ] 消息持久化与会话管理
- [ ] Vault CRUD（AI 读写文件）
- [ ] `@笔记名` 手动引用
- [ ] 提交 Obsidian 社区插件市场

## 许可证

Apache License 2.0

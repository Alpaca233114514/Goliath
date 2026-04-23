# Goliath

将 Obsidian 笔记桥接至 AI 编程工具与 API。

## 功能

- **多种导出格式**：将笔记导出为 Claude Code、Kimi Code CLI、OpenAI Chat Completions 及 OpenAI Response API 的提示词格式
- **多 API 服务商支持**：在 Obsidian 内直连 Anthropic、Google Gemini 或本地 OpenAI 兼容 API（如 LM Studio、Ollama 等）
- **上下文感知**：构建上下文时可包含链接笔记与 frontmatter
- **原生 Obsidian 集成**：侧边栏聊天视图、命令面板指令及设置页

## 安装

1. 下载最新版本
2. 解压至 Obsidian 仓库的 `.obsidian/plugins/goliath/` 目录
3. 在 Obsidian 设置 → 社区插件 中启用

## 配置

打开 设置 → Goliath 进行配置：

### API 服务商

- **Anthropic**：填写 API 密钥并选择模型（默认：`claude-sonnet-4-6`）
- **Google Gemini**：填写 API 密钥并选择模型（默认：`gemini-2.5-pro`）
- **本地 API**：配置 OpenAI 兼容本地服务的 base URL（默认：`http://localhost:1234/v1`）

### 上下文选项

- **系统提示词**：AI 对话的默认系统提示词
- **包含 Frontmatter**：上下文包含笔记 YAML frontmatter
- **包含链接笔记**：跟随 wiki-link 包含关联笔记
- **最大链接深度**：链接追踪层数（1-3）

## 使用

### 命令

| 命令 | 操作 |
|------|------|
| `Goliath: 打开聊天` | 打开侧边栏聊天 |
| `Goliath: 导出当前笔记为提示词` | 以选定格式复制当前笔记至剪贴板 |
| `Goliath: 与当前笔记聊天` | 以当前笔记为上下文打开聊天 |

### 聊天视图

点击左侧功能区 Goliath 图标或执行"打开聊天"打开侧边栏。支持流式响应。

### 导出格式

导出时可选：

- **Claude Code**：基于 `<file>` 标签的 XML 格式
- **Kimi Code CLI**：Markdown 标题格式
- **OpenAI Chat Completions**：标准 `messages` 数组 JSON
- **OpenAI Response API**：新版 Response API 含文件输入

## 开发

```bash
npm install
npm run dev      # 监听模式
npm run build    # 生产构建
npm test         # 运行测试
npm run test:coverage  # 运行测试并生成覆盖率报告
```

## 项目结构

```
src/
  main.ts              # 插件入口
  settings.ts          # 设置数据模型
  settings-tab.ts      # 设置 UI
  api/
    types.ts           # API 共享类型
    base-client.ts     # API 客户端抽象基类
    anthropic-client.ts
    gemini-client.ts
    openai-client.ts   # OpenAI 兼容（覆盖本地 API）
  formats/
    claude-code.ts
    kimi-code.ts
    oai-chat.ts
    oai-response.ts
  ui/
    export-modal.ts    # 格式选择模态框
    chat-view.ts       # 侧边栏聊天视图
  utils/
    vault-helpers.ts   # 仓库文件读取工具
```

import { Translations } from "./types";

export const zh: Translations = {
  pluginName: "Goliath",
  pluginDescription:
    "连接 Obsidian 笔记与 AI 编程工具及 API。支持 Claude Code、Kimi Code CLI、OpenAI 格式及多种 API 服务商。",

  settings: {
    title: "Goliath 设置",
    defaultProvider: "默认 API 服务商",
    defaultProviderDesc: "聊天使用的 AI 服务商",
    defaultFormat: "默认导出格式",
    defaultFormatDesc: "导出提示词时使用的格式",
    systemPrompt: "系统提示词",
    systemPromptDesc: "AI 对话的默认系统提示词",
    includeFrontmatter: "包含 Frontmatter",
    includeFrontmatterDesc: "构建上下文时包含笔记 frontmatter",
    includeLinkedNotes: "包含链接笔记",
    includeLinkedNotesDesc: "构建上下文时包含链接的笔记",
    maxLinkedDepth: "最大链接深度",
    maxLinkedDepthDesc: "链接追踪的层数",
    apiProviders: "API 服务商",
    enabled: "已启用",
    apiKey: "API 密钥",
    apiKeyDesc: "该服务商的 API 密钥",
    baseUrl: "Base URL",
    baseUrlDesc: "API 基础地址（通常无需修改）",
    model: "模型",
    modelDesc: "使用的模型名称",
    language: "语言",
    languageDesc: "界面语言",
  },

  commands: {
    openChat: "打开聊天",
    exportNote: "导出当前笔记为提示词",
    chatWithNote: "与当前笔记聊天",
  },

  ui: {
    exportTitle: "导出为提示词",
    cancel: "取消",
    copiedToClipboard: "已复制 {format} 格式到剪贴板",
    chatPlaceholder: "输入问题...",
    send: "发送",
    sending: "...",
    chatViewTitle: "Goliath 聊天",
    noActiveNote: "没有活动笔记",
    providerNotConfigured: "{provider} 未配置或未启用",
    exportFormatNames: {
      "claude-code": "Claude Code",
      "kimi-code": "Kimi Code CLI",
      "kimi-stream-json": "Kimi Stream JSON",
      "oai-chat": "OpenAI Chat Completions",
      "oai-response": "OpenAI Response API",
    },
    providerNames: {
      anthropic: "Anthropic",
      gemini: "Google Gemini",
      kimi: "Kimi（月之暗面）",
      local: "本地 API（OpenAI 兼容）",
    },
    kimiLoginSuccess: "Kimi 登录成功！",
    kimiLoginFailed: "Kimi 登录失败。",
    kimiLogoutSuccess: "已退出 Kimi 登录。",
  },

  errors: {
    apiError: "API 错误 {status}：{message}",
    responseNotReadable: "响应体不可读",
  },
};

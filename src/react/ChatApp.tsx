import { useState, useRef, useCallback, useEffect } from "react";
import {
  Button,
  Dropdown,
  Menu,
  Tooltip,
  Empty,
} from "@arco-design/web-react";
import {
  IconArrowUp,
  IconFile,
  IconDown,
  IconBulb,
  IconRecordStop,
  IconRefresh,
  IconCopy,
  IconDelete,
  IconPlus,
  IconHistory,
  IconCheck,
  IconExclamation,
} from "@arco-design/web-react/icon";
import { useObsidian } from "./contexts/ObsidianContext";
import { MarkdownContent } from "./components/MarkdownContent";
import { StreamingIndicator } from "./components/StreamingIndicator";
import type { Message, ToolResult } from "../api/types";
import type { ChatView } from "../ui/chat-view";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
  toolResults?: ToolResult[];
}

export default function ChatApp() {
  const { view } = useObsidian();
  const chatView = view as ChatView;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [model, setModel] = useState(chatView.getCurrentModel() || "");
  const [providerName, setProviderName] = useState(
    chatView.getCurrentProviderName() || ""
  );
  const [systemPrompt, setSystemPrompt] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef(false);

  // Listen for model info changes from the plugin
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.providerName) setProviderName(detail.providerName);
      if (detail.model) setModel(detail.model);
    };
    view.containerEl.addEventListener("goliath-model-info", handler);
    return () =>
      view.containerEl.removeEventListener("goliath-model-info", handler);
  }, [view]);

  // Listen for system prompt changes
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.prompt !== undefined) setSystemPrompt(detail.prompt);
    };
    view.containerEl.addEventListener("goliath-system-prompt", handler);
    return () =>
      view.containerEl.removeEventListener("goliath-system-prompt", handler);
  }, [view]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
    textareaRef.current.style.height = `${newHeight}px`;
  }, [inputText]);

  const stopGeneration = useCallback(() => {
    abortRef.current = true;
    setIsGenerating(false);
  }, []);

  const sendMessage = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isGenerating) return;

    const chatCore = chatView.getChatCore();
    if (!chatCore) {
      return;
    }

    setInputText("");
    abortRef.current = false;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: trimmed,
    };

    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsGenerating(true);

    const history = buildMessageHistory(
      [...messages, userMessage],
      systemPrompt
    );

    try {
      let streamedContent = "";
      const result = await chatCore.sendMessage(
        history,
        (chunk: string) => {
          if (abortRef.current) return;
          streamedContent += chunk;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, content: streamedContent }
                : m
            )
          );
        }
      );

      if (abortRef.current) return;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? {
                ...m,
                content: result.content,
                toolResults: result.toolResults,
              }
            : m
        )
      );
    } catch (error) {
      if (abortRef.current) return;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? { ...m, content: `Error: ${errorMessage}`, isError: true }
            : m
        )
      );
    } finally {
      setIsGenerating(false);
      abortRef.current = false;
    }
  }, [inputText, isGenerating, messages, chatView, systemPrompt]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (isGenerating) {
          stopGeneration();
        } else {
          sendMessage();
        }
      }
    },
    [isGenerating, sendMessage, stopGeneration]
  );

  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setInputText("");
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          borderBottom: "1px solid var(--background-modifier-border)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {providerName && model && (
            <Dropdown
              trigger="click"
              droplist={
                <Menu>
                  <Menu.Item key="current-model" disabled>
                    {providerName} · {model}
                  </Menu.Item>
                </Menu>
              }
            >
              <Button type="text" size="mini">
                {providerName} · {model}
                <IconDown style={{ marginLeft: 4, fontSize: 12 }} />
              </Button>
            </Dropdown>
          )}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <Tooltip content="New chat" mini>
            <Button
              type="text"
              size="mini"
              icon={<IconPlus />}
              onClick={handleNewChat}
            />
          </Tooltip>
          <Tooltip content="History" mini>
            <Button type="text" size="mini" icon={<IconHistory />} />
          </Tooltip>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Empty description="Start a new conversation" />
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessageBubble
                key={msg.id}
                message={msg}
                modelLabel={msg.role === "assistant" ? model : undefined}
                isStreaming={
                  isGenerating &&
                  msg.role === "assistant" &&
                  msg === messages[messages.length - 1]
                }
                onCopy={() => handleCopy(msg.content)}
                onDelete={() => handleDelete(msg.id)}
              />
            ))}
            {isGenerating &&
              messages[messages.length - 1]?.role === "user" && (
                <StreamingIndicator />
              )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div
        style={{
          padding: "12px",
          borderTop: "1px solid var(--background-modifier-border)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: "12px 16px",
            border: "1px solid var(--background-modifier-border)",
            borderRadius: 16,
            backgroundColor: "var(--background-primary)",
          }}
        >
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            disabled={isGenerating}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
              resize: "none",
              minHeight: 24,
              maxHeight: 200,
              height: 24,
              overflowY: "auto",
              fontSize: 14,
              lineHeight: 1.5,
              color: "var(--text-normal)",
              fontFamily: "inherit",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", gap: 4 }}>
              <Tooltip content="Add context" mini>
                <Button type="text" size="mini" icon={<IconFile />} />
              </Tooltip>
            </div>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <Tooltip content="Reasoning" mini>
                <Button type="text" size="mini" icon={<IconBulb />} />
              </Tooltip>
              <Button
                type="primary"
                shape="circle"
                size="mini"
                status={isGenerating ? "danger" : undefined}
                icon={
                  isGenerating ? <IconRecordStop /> : <IconArrowUp />
                }
                onClick={isGenerating ? stopGeneration : sendMessage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Sub-components */

interface ChatMessageBubbleProps {
  message: ChatMessage;
  modelLabel?: string;
  isStreaming?: boolean;
  onCopy: () => void;
  onDelete: () => void;
}

function ChatMessageBubble({
  message,
  modelLabel,
  isStreaming,
  onCopy,
  onDelete,
}: ChatMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        maxWidth: "90%",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {modelLabel && !isUser && (
        <span
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            fontWeight: 600,
          }}
        >
          {modelLabel}
        </span>
      )}
      <div
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          backgroundColor: isUser
            ? "var(--interactive-accent)"
            : "var(--background-secondary)",
          color: isUser ? "var(--text-on-accent)" : "var(--text-normal)",
          border: isUser
            ? "none"
            : "1px solid var(--background-modifier-border)",
        }}
      >
        {isUser ? (
          <div
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {message.content}
          </div>
        ) : (
          <div>
            {isStreaming && !message.content ? (
              <StreamingIndicator />
            ) : (
              <MarkdownContent
                markdown={message.content}
                isError={message.isError}
              />
            )}
          </div>
        )}
      </div>

      {/* Tool results */}
      {!isUser && message.toolResults && message.toolResults.length > 0 && (
        <ToolResultList results={message.toolResults} />
      )}

      {!isUser && !isStreaming && (
        <div
          style={{
            display: "flex",
            gap: 8,
            opacity: 0,
            transition: "opacity 0.2s",
          }}
          className="message-actions"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = "0";
          }}
        >
          <Tooltip content="Copy" mini>
            <Button
              type="text"
              size="mini"
              icon={<IconCopy />}
              onClick={onCopy}
            />
          </Tooltip>
          <Tooltip content="Regenerate" mini>
            <Button type="text" size="mini" icon={<IconRefresh />} />
          </Tooltip>
          <Tooltip content="Delete" mini>
            <Button
              type="text"
              size="mini"
              icon={<IconDelete />}
              onClick={onDelete}
            />
          </Tooltip>
        </div>
      )}
    </div>
  );
}

function ToolResultList({ results }: { results: ToolResult[] }) {
  return (
    <div
      style={{
        marginTop: 4,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {results.map((result) => (
        <div
          key={result.toolCallId}
          style={{
            fontSize: 11,
            padding: "4px 8px",
            borderRadius: 4,
            backgroundColor: "var(--background-modifier-form-field)",
            color: result.isError
              ? "var(--text-error)"
              : "var(--text-muted)",
            border: `1px solid ${
              result.isError
                ? "var(--background-modifier-error)"
                : "var(--background-modifier-border)"
            }`,
          }}
        >
          <div style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 4 }}>
            {result.isError ? (
              <IconExclamation style={{ fontSize: 12 }} />
            ) : (
              <IconCheck style={{ fontSize: 12 }} />
            )}
            {result.name}
          </div>
          <div
            style={{
              marginTop: 2,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {result.content.slice(0, 200)}
            {result.content.length > 200 ? "..." : ""}
          </div>
        </div>
      ))}
    </div>
  );
}

/* Utilities */

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function buildMessageHistory(
  messages: ChatMessage[],
  systemPrompt: string
): Message[] {
  const history: Message[] = [];
  if (systemPrompt) {
    history.push({ role: "system", content: systemPrompt });
  }
  for (const msg of messages) {
    history.push({ role: msg.role, content: msg.content });
  }
  return history;
}

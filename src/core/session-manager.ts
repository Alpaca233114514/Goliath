import { App, TFile } from "obsidian";
import { Message } from "../api/types";

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model?: string;
  provider?: string;
}

const SESSIONS_FOLDER = "goliath-sessions";

export class SessionManager {
  constructor(private app: App) {}

  async saveSession(session: Session): Promise<void> {
    await this.ensureFolder();
    const fileName = `${SESSIONS_FOLDER}/${session.id}.md`;
    const content = this.serializeSession(session);

    const existing = this.app.vault.getAbstractFileByPath(fileName);
    if (existing instanceof TFile) {
      await this.app.vault.modify(existing, content);
    } else {
      await this.app.vault.create(fileName, content);
    }
  }

  async loadSession(sessionId: string): Promise<Session | null> {
    const fileName = `${SESSIONS_FOLDER}/${sessionId}.md`;
    const file = this.app.vault.getAbstractFileByPath(fileName);
    if (!file || !(file instanceof TFile)) return null;

    const content = await this.app.vault.cachedRead(file);
    return this.deserializeSession(sessionId, content);
  }

  async listSessions(): Promise<Session[]> {
    const files = this.app.vault.getMarkdownFiles().filter((f) =>
      f.path.startsWith(`${SESSIONS_FOLDER}/`)
    );

    const sessions: Session[] = [];
    for (const file of files) {
      const id = file.basename;
      const content = await this.app.vault.cachedRead(file);
      const session = this.deserializeSession(id, content);
      if (session) sessions.push(session);
    }

    return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async deleteSession(sessionId: string): Promise<void> {
    const fileName = `${SESSIONS_FOLDER}/${sessionId}.md`;
    const file = this.app.vault.getAbstractFileByPath(fileName);
    if (file) {
      await this.app.vault.delete(file);
    }
  }

  private async ensureFolder(): Promise<void> {
    const folder = this.app.vault.getAbstractFileByPath(SESSIONS_FOLDER);
    if (!folder) {
      await this.app.vault.createFolder(SESSIONS_FOLDER);
    }
  }

  private serializeSession(session: Session): string {
    const frontmatter = [
      `---`,
      `id: ${session.id}`,
      `title: ${session.title}`,
      `createdAt: ${session.createdAt}`,
      `updatedAt: ${session.updatedAt}`,
      session.model ? `model: ${session.model}` : "",
      session.provider ? `provider: ${session.provider}` : "",
      `---`,
      ``,
    ]
      .filter(Boolean)
      .join("\n");

    const messages = session.messages
      .map((msg) => {
        const prefix = msg.role === "user" ? "## User" : msg.role === "assistant" ? "## Assistant" : msg.role === "system" ? "## System" : "## Tool";
        return `${prefix}\n\n${msg.content}`;
      })
      .join("\n\n---\n\n");

    return `${frontmatter}\n${messages}`;
  }

  private deserializeSession(id: string, content: string): Session | null {
    const lines = content.split("\n");
    let inFrontmatter = false;
    let frontmatterEnd = 0;
    const metadata: Record<string, string> = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line === "---") {
        if (!inFrontmatter) {
          inFrontmatter = true;
        } else {
          frontmatterEnd = i;
          break;
        }
        continue;
      }
      if (inFrontmatter) {
        const colonIndex = line.indexOf(":");
        if (colonIndex > 0) {
          const key = line.slice(0, colonIndex).trim();
          const value = line.slice(colonIndex + 1).trim();
          metadata[key] = value;
        }
      }
    }

    const body = lines.slice(frontmatterEnd + 1).join("\n").trim();
    const messages = this.parseMessages(body);

    return {
      id: metadata.id || id,
      title: metadata.title || "Untitled Session",
      messages,
      createdAt: parseInt(metadata.createdAt || "0"),
      updatedAt: parseInt(metadata.updatedAt || "0"),
      model: metadata.model,
      provider: metadata.provider,
    };
  }

  private parseMessages(body: string): Message[] {
    const messages: Message[] = [];
    const sections = body.split(/\n---\n/);

    for (const section of sections) {
      const trimmed = section.trim();
      if (!trimmed) continue;

      const match = trimmed.match(/^##\s*(User|Assistant|System|Tool)\n\n?([\s\S]*)$/);
      if (match) {
        const roleMap: Record<string, Message["role"]> = {
          User: "user",
          Assistant: "assistant",
          System: "system",
          Tool: "tool",
        };
        messages.push({
          role: roleMap[match[1]] || "user",
          content: match[2].trim(),
        });
      }
    }

    return messages;
  }
}

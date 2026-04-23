# Third-Party Notices

This project references architectural patterns and design concepts from [Continue.dev](https://github.com/continuedev/continue), licensed under the Apache License 2.0.

Specifically, the following backend architecture patterns were inspired by Continue.dev:

- **Tool System** (`src/core/tools/`): Tool registry, dispatch, and implementation patterns
- **Chat Core** (`src/core/chat-core.ts`): LLM orchestration with tool calling loop
- **Context Provider concept**: Extensible context gathering architecture

The actual implementation code is written specifically for the Obsidian plugin environment and is not a direct copy of Continue.dev source code.

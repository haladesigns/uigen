# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Initial setup (install deps, generate Prisma client, run migrations)
npm run setup

# Development server (with turbopack)
npm run dev

# Build
npm run build

# Lint
npm run lint

# Run all tests
npm test

# Run a single test file
npx vitest run src/components/chat/__tests__/ChatInterface.test.tsx

# Reset database
npm run db:reset
```

## Architecture

UIGen is an AI-powered React component generator. Users describe components in a chat, Claude generates them using tool calls, and the result renders in a live preview — all without writing files to disk.

### Key data flow

1. **Chat** (`src/app/api/chat/route.ts`): The POST handler receives messages + the serialized virtual FS, reconstructs a `VirtualFileSystem`, streams a response from Claude (or mock), and on finish persists updated messages + FS to the DB project row.

2. **Virtual File System** (`src/lib/file-system.ts`): An in-memory FS (`VirtualFileSystem` class) that stores files as a `Map<string, FileNode>`. It supports CRUD, rename, serialize/deserialize, and text-editor-style operations (`viewFile`, `replaceInFile`, `insertInFile`). There is no real disk I/O for generated files.

3. **AI Tools**: The API route equips the model with two tools:
   - `str_replace_editor` (`src/lib/tools/str-replace.ts`): create/view/str_replace/insert on virtual files
   - `file_manager` (`src/lib/tools/file-manager.ts`): rename/delete on virtual files

4. **Preview** (`src/components/preview/PreviewFrame.tsx` + `src/lib/transform/jsx-transformer.ts`): Files from the virtual FS are Babel-transformed client-side, turned into blob URLs, assembled into an ES import map, and injected into a sandboxed `<iframe>` as a full HTML document. Third-party npm imports are resolved via `esm.sh`. The entry point is `/App.jsx` (falls back to `/App.tsx`, `/index.jsx`, etc.).

5. **Contexts**:
   - `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`): Wraps `VirtualFileSystem`, exposes file operations, and handles `handleToolCall` to apply AI tool calls to the FS and trigger re-renders via `refreshTrigger`.
   - `ChatContext` (`src/lib/contexts/chat-context.tsx`): Manages Vercel AI SDK `useChat`, forwards tool calls to `FileSystemContext`, and tracks streaming state.

6. **Layout** (`src/app/main-content.tsx`): Three-panel layout — Chat (left) | Preview or Code editor (right). The Code view shows a `FileTree` + Monaco `CodeEditor`. Both panels are resizable.

### AI provider

`src/lib/provider.ts` exports `getLanguageModel()`. If `ANTHROPIC_API_KEY` is set it returns a real `claude-haiku-4-5` model; otherwise it returns `MockLanguageModel`, which streams static pre-written component code without any API call.

### Auth

Custom JWT-based auth (`src/lib/auth.ts`) using `jose`. Sessions are stored in an `httpOnly` cookie (`auth-token`), expire in 7 days. No third-party auth library. Middleware (`src/middleware.ts`) protects routes.

### Database

SQLite via Prisma. Two models: `User` (email + bcrypt password) and `Project` (stores `messages` and `data` as JSON strings). The Prisma client is generated to `src/generated/prisma`.

### Generation prompt rules (enforced by `src/lib/prompts/generation.tsx`)

- Every project must have a root `/App.jsx` as the entry point.
- Style with Tailwind, not inline styles.
- Local file imports must use the `@/` alias (e.g., `@/components/Button`).
- No HTML files — `/App.jsx` is the entrypoint.

### Testing

Tests use Vitest + jsdom + React Testing Library. Test files are colocated in `__tests__/` directories next to their source. Run a specific test with `npx vitest run <path>`.

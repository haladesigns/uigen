import { test, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MainContent } from "../main-content";

// Mock all child components that have complex dependencies
vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: any) => <div>{children}</div>,
  useFileSystem: vi.fn(() => ({
    getAllFiles: vi.fn(() => new Map()),
    refreshTrigger: 0,
    selectedFile: null,
    getFileContent: vi.fn(),
    updateFile: vi.fn(),
  })),
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: any) => <div>{children}</div>,
  useChat: vi.fn(() => ({
    messages: [],
    input: "",
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    isLoading: false,
  })),
}));

vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div data-testid="chat-interface">Chat</div>,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame">Preview</div>,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div data-testid="file-tree">FileTree</div>,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor">CodeEditor</div>,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div data-testid="header-actions">HeaderActions</div>,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

test("starts on preview tab by default", () => {
  render(<MainContent />);

  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("switches to code view when Code tab is clicked", async () => {
  render(<MainContent />);

  // Initially showing preview
  expect(screen.getByTestId("preview-frame")).toBeDefined();

  // Click the Code tab using fireEvent
  const codeTab = screen.getByRole("tab", { name: "Code" });
  await act(async () => {
    fireEvent.mouseDown(codeTab);
    fireEvent.mouseUp(codeTab);
    fireEvent.click(codeTab);
  });

  // Should now show code editor
  expect(screen.getByTestId("code-editor")).toBeDefined();
  expect(screen.queryByTestId("preview-frame")).toBeNull();
});

test("switches back to preview when Preview tab is clicked", async () => {
  render(<MainContent />);

  // Click Code tab first
  const codeTab = screen.getByRole("tab", { name: "Code" });
  await act(async () => {
    fireEvent.mouseDown(codeTab);
    fireEvent.mouseUp(codeTab);
    fireEvent.click(codeTab);
  });
  expect(screen.getByTestId("code-editor")).toBeDefined();

  // Click Preview tab
  const previewTab = screen.getByRole("tab", { name: "Preview" });
  await act(async () => {
    fireEvent.mouseDown(previewTab);
    fireEvent.mouseUp(previewTab);
    fireEvent.click(previewTab);
  });

  // Should now show preview again
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("can toggle between views multiple times", async () => {
  render(<MainContent />);

  const codeTab = screen.getByRole("tab", { name: "Code" });
  const previewTab = screen.getByRole("tab", { name: "Preview" });

  // Preview → Code
  await act(async () => {
    fireEvent.mouseDown(codeTab);
    fireEvent.mouseUp(codeTab);
    fireEvent.click(codeTab);
  });
  expect(screen.getByTestId("code-editor")).toBeDefined();

  // Code → Preview
  await act(async () => {
    fireEvent.mouseDown(previewTab);
    fireEvent.mouseUp(previewTab);
    fireEvent.click(previewTab);
  });
  expect(screen.getByTestId("preview-frame")).toBeDefined();

  // Preview → Code again
  await act(async () => {
    fireEvent.mouseDown(codeTab);
    fireEvent.mouseUp(codeTab);
    fireEvent.click(codeTab);
  });
  expect(screen.getByTestId("code-editor")).toBeDefined();
});

test("Preview tab shows as active on initial render", () => {
  render(<MainContent />);

  const previewTab = screen.getByRole("tab", { name: "Preview" });
  expect(previewTab.getAttribute("data-state")).toBe("active");

  const codeTab = screen.getByRole("tab", { name: "Code" });
  expect(codeTab.getAttribute("data-state")).toBe("inactive");
});

test("Code tab becomes active after clicking it", async () => {
  render(<MainContent />);

  const codeTab = screen.getByRole("tab", { name: "Code" });
  await act(async () => {
    fireEvent.mouseDown(codeTab);
    fireEvent.mouseUp(codeTab);
    fireEvent.click(codeTab);
  });

  expect(codeTab.getAttribute("data-state")).toBe("active");

  const previewTab = screen.getByRole("tab", { name: "Preview" });
  expect(previewTab.getAttribute("data-state")).toBe("inactive");
});

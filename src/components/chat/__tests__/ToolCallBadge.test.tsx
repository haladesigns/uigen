import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getToolLabel } from "../ToolCallBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// getToolLabel — pure function tests (no rendering needed)
// ---------------------------------------------------------------------------

// str_replace_editor
test("getToolLabel: str_replace_editor create", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "/App.jsx" })).toBe("Creating App.jsx");
});

test("getToolLabel: str_replace_editor create strips leading slash", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "/components/Card.tsx" })).toBe("Creating components/Card.tsx");
});

test("getToolLabel: str_replace_editor str_replace", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "/App.jsx" })).toBe("Editing App.jsx");
});

test("getToolLabel: str_replace_editor insert", () => {
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "/App.jsx" })).toBe("Editing App.jsx");
});

test("getToolLabel: str_replace_editor view", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "/App.jsx" })).toBe("Reading App.jsx");
});

test("getToolLabel: str_replace_editor undo_edit", () => {
  expect(getToolLabel("str_replace_editor", { command: "undo_edit", path: "/App.jsx" })).toBe("Undoing edit on App.jsx");
});

// file_manager
test("getToolLabel: file_manager rename", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "/old.jsx", new_path: "/new.jsx" })).toBe("Renaming old.jsx to new.jsx");
});

test("getToolLabel: file_manager rename without new_path (partial args during streaming)", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "/old.jsx" })).toBe("Renaming old.jsx");
});

test("getToolLabel: file_manager delete", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "/App.jsx" })).toBe("Deleting App.jsx");
});

// Fallbacks
test("getToolLabel: falls back to toolName for unknown tool", () => {
  expect(getToolLabel("unknown_tool", { command: "foo" })).toBe("unknown_tool");
});

test("getToolLabel: falls back to toolName when path is missing", () => {
  expect(getToolLabel("str_replace_editor", { command: "create" })).toBe("str_replace_editor");
});

test("getToolLabel: falls back to toolName for known tool with unknown command", () => {
  expect(getToolLabel("str_replace_editor", { command: "unknown_cmd", path: "/App.jsx" })).toBe("str_replace_editor");
});

// ---------------------------------------------------------------------------
// ToolCallBadge — component render tests
// ---------------------------------------------------------------------------

function makeInvocation(
  toolName: string,
  args: Record<string, unknown>,
  state: "call" | "result" = "result"
): ToolInvocation {
  return {
    toolCallId: "test-id",
    toolName,
    args,
    state,
    ...(state === "result" ? { result: "ok" } : {}),
  } as ToolInvocation;
}

test("ToolCallBadge renders label text", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/App.jsx" })}
    />
  );
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("ToolCallBadge shows green dot when state is result", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/App.jsx" }, "result")}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).not.toBeNull();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("ToolCallBadge shows spinner when state is call", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/App.jsx" }, "call")}
    />
  );
  expect(container.querySelector(".animate-spin")).not.toBeNull();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolCallBadge falls back to toolName with empty args", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {})}
    />
  );
  expect(screen.getByText("str_replace_editor")).toBeDefined();
});

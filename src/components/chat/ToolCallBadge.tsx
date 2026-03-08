"use client";

import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

interface ToolCallBadgeProps {
  toolInvocation: ToolInvocation;
}

function formatPath(path: string): string {
  return path.startsWith("/") ? path.slice(1) : path;
}

export function getToolLabel(
  toolName: string,
  args: Record<string, unknown>
): string {
  const path = typeof args.path === "string" ? args.path : null;
  const newPath = typeof args.new_path === "string" ? args.new_path : null;

  if (toolName === "str_replace_editor" && path) {
    const file = formatPath(path);
    switch (args.command) {
      case "create":
        return `Creating ${file}`;
      case "str_replace":
      case "insert":
        return `Editing ${file}`;
      case "view":
        return `Reading ${file}`;
      case "undo_edit":
        return `Undoing edit on ${file}`;
    }
  }

  if (toolName === "file_manager" && path) {
    switch (args.command) {
      case "rename":
        return newPath
          ? `Renaming ${formatPath(path)} to ${formatPath(newPath)}`
          : `Renaming ${formatPath(path)}`;
      case "delete":
        return `Deleting ${formatPath(path)}`;
    }
  }

  return toolName;
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const { toolName, args, state } = toolInvocation;
  const label = getToolLabel(toolName, args as Record<string, unknown>);
  const isDone = state === "result";

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 flex-shrink-0" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}

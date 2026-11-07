"use client";

import { useMemo } from "react";
import { sanitizeCmsHtml } from "./cms.service";
import type { ContentRendererProps } from "./cms.types";
import "./tiptap.css";

export function ContentRenderer({
  content,
  className = "",
  fallbackText = "Chưa có nội dung văn bản được công bố.",
}: ContentRendererProps) {
  const isHtml = useMemo(() => {
    if (!content) return false;
    return /<[a-z][\s\S]*>/i.test(content);
  }, [content]);

  const cleanHtml = useMemo(() => {
    if (!content) return "";
    if (!isHtml) {
      // Legacy plain-text fallback: convert newlines into paragraphs
      return content
        .split(/\n\s*\n/)
        .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
        .join("");
    }
    return sanitizeCmsHtml(content);
  }, [content, isHtml]);

  if (!content || !content.trim()) {
    return (
      <div className={`text-slate-400 italic text-sm py-4 ${className}`}>
        {fallbackText}
      </div>
    );
  }

  return (
    <div
      className={`prose-utc break-words [overflow-wrap:anywhere] [word-break:break-word] max-w-full overflow-hidden ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
}
export default ContentRenderer;

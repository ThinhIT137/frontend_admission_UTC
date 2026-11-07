"use client";

import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { Highlight } from "@tiptap/extension-highlight";

import { useEffect, useRef, useState } from "react";
import { countWordsAndChars, getLocalDraft, saveLocalDraft } from "./cms.service";
import type { CmsEditorProps } from "./cms.types";

export function useCmsEditor({
  initialContent = "",
  placeholder = "Nhập nội dung bài viết, đề án hoặc hướng dẫn tại đây...",
  onChange,
  editable = true,
  draftKey,
}: CmsEditorProps) {
  const [stats, setStats] = useState({ words: 0, chars: 0 });
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check for local draft on initial load
  const contentToLoad = useRef(initialContent);
  useEffect(() => {
    if (draftKey && !initialContent) {
      const draft = getLocalDraft(draftKey);
      if (draft?.content) {
        contentToLoad.current = draft.content;
        setLastSaved(draft.savedAt);
      }
    }
  }, [draftKey, initialContent]);

  const editor = useEditor({
    immediatelyRender: false, // Critical for Next.js SSR hydration safety
    editable,
    content: contentToLoad.current,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          HTMLAttributes: {
            class: "cms-bullet-list",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "cms-ordered-list",
          },
        },
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
          class: "cms-link",
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "cms-image",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "cms-table",
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList.configure({
        HTMLAttributes: {
          class: "cms-task-list",
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "cms-task-item",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      const wordCount = countWordsAndChars(text);
      setStats(wordCount);

      if (onChange) {
        onChange(html, text);
      }

      // Auto-save draft if draftKey is supplied (debounced by 1s)
      if (draftKey) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          saveLocalDraft(draftKey, html);
          setLastSaved(Date.now());
        }, 1000);
      }
    },
  });

  // Calculate initial word count on mount
  useEffect(() => {
    if (editor) {
      setStats(countWordsAndChars(editor.getText()));
    }
  }, [editor]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    editor,
    stats,
    lastSaved,
  };
}

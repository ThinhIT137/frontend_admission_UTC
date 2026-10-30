"use client";

import { useEffect, useRef } from "react";

type DialogOwner = { element: HTMLDivElement | null; focusFirst: () => void };
// Ownership survives focus falling onto <body> after an action removes its button.
// Only the top owner handles keyboard events, including while its buttons are disabled.
const dialogStack: DialogOwner[] = [];
let originalBodyOverflow = "";

export function useAdminDialog(open: boolean, close: () => void, pending = false) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(close);
  const pendingRef = useRef(pending);
  closeRef.current = close;
  pendingRef.current = pending;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    if (dialogStack.length === 0) originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const items = () => Array.from(ref.current?.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]',
    ) ?? []);
    const owner: DialogOwner = {
      element: ref.current,
      focusFirst: () => (items()[0] ?? ref.current)?.focus(),
    };
    // Child effects can mount before their parent effect. Keep a containing dialog
    // below an already registered nested dialog in that case.
    const nestedIndex = dialogStack.findIndex(dialog =>
      !!dialog.element && !!owner.element?.contains(dialog.element),
    );
    if (nestedIndex < 0) dialogStack.push(owner);
    else dialogStack.splice(nestedIndex, 0, owner);
    if (dialogStack[dialogStack.length - 1] === owner) owner.focusFirst();
    const keydown = (event: KeyboardEvent) => {
      if (dialogStack[dialogStack.length - 1] !== owner) return;
      if (event.key === "Escape") {
        event.preventDefault(); event.stopImmediatePropagation();
        if (!pendingRef.current) closeRef.current();
      }
      if (event.key === "Tab") {
        const list = items(); const first = list[0]; const last = list[list.length - 1];
        if (!first) { event.preventDefault(); ref.current?.focus(); }
        else if (!ref.current?.contains(document.activeElement)) {
          event.preventDefault(); (event.shiftKey ? last : first).focus();
        }
        else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      const wasTop = dialogStack[dialogStack.length - 1] === owner;
      const index = dialogStack.indexOf(owner);
      if (index >= 0) dialogStack.splice(index, 1);
      if (dialogStack.length === 0) document.body.style.overflow = originalBodyOverflow;
      if (wasTop) {
        const next = dialogStack[dialogStack.length - 1];
        if (previous?.isConnected && (!next || next.element?.contains(previous))) previous.focus();
        else next?.focusFirst();
      }
    };
  }, [open]);
  return ref;
}

"use client";

import { useCallback, useRef, useState } from "react";

/** The ref blocks repeated events before React has rendered the disabled state. */
export function useAdminTask() {
  const lock = useRef(false);
  const [pending, setPending] = useState(false);
  const run = useCallback(async (task: () => void | Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setPending(true);
    try { await task(); }
    finally { lock.current = false; setPending(false); }
  }, []);
  return { pending, run };
}

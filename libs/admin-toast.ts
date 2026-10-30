"use client";
import { toast as sonner } from "sonner";

/** Replace the previous admin result instead of stacking rapid workflow steps. */
const feedbackId = "admin-action-feedback";
function notify(level: "success" | "error" | "warning" | "info") {
  return (...[message, options]: Parameters<typeof sonner.success>) =>
    sonner[level](message, { ...options, id: feedbackId });
}
export const toast = {
  success: notify("success"), error: notify("error"),
  warning: notify("warning"), info: notify("info"),
};

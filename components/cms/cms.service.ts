/**
 * CMS Client Service & Utilities for Content Management
 */

/**
 * Sanitize HTML to prevent XSS attacks while preserving formatting.
 * Safe for both browser and SSR contexts.
 */
export function sanitizeCmsHtml(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== "string") return "";

  if (typeof window === "undefined") {
    // Basic server-side fallback: strip script tags and event handlers
    return rawHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
      .replace(/javascript:/gi, "");
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, "text/html");

    // Remove dangerous elements
    const dangerousTags = ["script", "iframe", "object", "embed", "applet", "base", "form"];
    dangerousTags.forEach((tag) => {
      const elements = doc.querySelectorAll(tag);
      elements.forEach((el) => el.remove());
    });

    // Clean all attributes for potential XSS
    const allElements = doc.querySelectorAll("*");
    allElements.forEach((el) => {
      // Remove inline event handlers (onclick, onerror, onload, etc.)
      const attributes = Array.from(el.attributes);
      for (const attr of attributes) {
        const name = attr.name.toLowerCase();
        const value = attr.value.toLowerCase().trim();

        if (name.startsWith("on")) {
          el.removeAttribute(attr.name);
        } else if (
          (name === "href" || name === "src") &&
          (value.startsWith("javascript:") || value.startsWith("data:text/html") || value.startsWith("vbscript:"))
        ) {
          el.removeAttribute(attr.name);
        }
      }

      // Ensure links are safe
      if (el.tagName.toLowerCase() === "a") {
        const href = el.getAttribute("href") || "";
        if (href.startsWith("http://") || href.startsWith("https://")) {
          el.setAttribute("target", "_blank");
          el.setAttribute("rel", "noopener noreferrer");
        }
      }
    });

    return doc.body.innerHTML;
  } catch (err) {
    console.error("Error sanitizing CMS HTML:", err);
    return rawHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  }
}

/**
 * Extracts plain-text summary from HTML without tags
 */
export function extractCmsSummary(html: string, maxLength: number = 160): string {
  if (!html) return "";
  const plainText = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (plainText.length <= maxLength) return plainText;
  return plainText.slice(0, maxLength).trim() + "...";
}

/**
 * Counts characters and words (supports Vietnamese & international text)
 */
export function countWordsAndChars(text: string): { words: number; chars: number } {
  if (!text) return { words: 0, chars: 0 };
  const trimmed = text.trim();
  const chars = trimmed.length;
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  return { words, chars };
}

/**
 * Local Draft Storage (Auto-save)
 */
const CMS_DRAFT_PREFIX = "utc_cms_draft_";

export function saveLocalDraft(key: string, content: string): void {
  if (typeof window === "undefined" || !key) return;
  try {
    const payload = {
      content,
      savedAt: Date.now(),
    };
    window.localStorage.setItem(`${CMS_DRAFT_PREFIX}${key}`, JSON.stringify(payload));
  } catch (err) {
    // LocalStorage quota exceeded or disabled
    console.warn("Could not save local CMS draft:", err);
  }
}

export function getLocalDraft(key: string): { content: string; savedAt: number } | null {
  if (typeof window === "undefined" || !key) return null;
  try {
    const raw = window.localStorage.getItem(`${CMS_DRAFT_PREFIX}${key}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearLocalDraft(key: string): void {
  if (typeof window === "undefined" || !key) return;
  try {
    window.localStorage.removeItem(`${CMS_DRAFT_PREFIX}${key}`);
  } catch {
    // ignore
  }
}

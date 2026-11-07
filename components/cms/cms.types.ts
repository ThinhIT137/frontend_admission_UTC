/**
 * CMS Contracts & Types for UTC Admissions System
 */

export type CmsCategory =
  | "ĐỀ ÁN"
  | "QUY CHẾ"
  | "TIN TỨC"
  | "HƯỚNG DẪN"
  | "FAQ"
  | "CHECKLIST";

export type CmsStatus = "PUBLISHED" | "DRAFT";

export interface CmsArticle {
  id: string;
  title: string;
  category: CmsCategory;
  summary: string;
  content: string; // Structured HTML
  fileName?: string;
  fileUrl?: string;
  fileSize?: string;
  publishedDate: string;
  status: CmsStatus;
}

export interface CmsEditorProps {
  initialContent?: string;
  placeholder?: string;
  onChange?: (html: string, text: string) => void;
  editable?: boolean;
  draftKey?: string;
  minHeight?: string;
  className?: string;
}

export interface ContentRendererProps {
  content?: string | null;
  className?: string;
  fallbackText?: string;
}

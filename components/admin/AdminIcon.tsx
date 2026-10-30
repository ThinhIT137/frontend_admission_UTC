import {
  AlertCircle, ArrowDownToLine, ArrowRight, ArrowUpRight, Bot, CalendarDays,
  ChartColumn, ChartLine, ChartPie, Check, CheckCheck, ChevronDown, ChevronLeft,
  ChevronRight, CircleCheck, CircleHelp, CirclePlus, Clock, Download, FileCheck,
  FileText, Filter, Folder, GraduationCap, Hourglass, Inbox, Info, Layers,
  LayoutList, LibraryBig, LoaderCircle, Pencil, Play, Plus, Printer, Save,
  Search, Settings2, ShieldCheck, ShieldPlus, Table, Trash2, University, Users,
  Waypoints, X, Eye, Brain, type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  account_balance: University, add: Plus, add_box: CirclePlus, add_circle: CirclePlus,
  add_moderator: ShieldPlus, analytics: ChartColumn, arrow_drop_down: ChevronDown,
  arrow_forward: ArrowRight, assignment_turned_in: FileCheck, calendar_month: CalendarDays,
  category: Layers, check: Check, chevron_left: ChevronLeft, chevron_right: ChevronRight,
  close: X, delete: Trash2, download: Download, edit: Pencil, edit_note: Pencil,
  error: AlertCircle, file_download: ArrowDownToLine, filter_alt: Filter, folder: Folder,
  hourglass_empty: Hourglass, how_to_reg: Users, inbox: Inbox, info: Info,
  monitoring: ChartLine, open_in_new: ArrowUpRight, pending: Clock, picture_as_pdf: FileText,
  pie_chart: ChartPie, play_arrow: Play, print: Printer, progress_activity: LoaderCircle,
  psychology: Brain, save: Save, schedule: Clock, school: GraduationCap, search: Search,
  shield_person: ShieldCheck, show_chart: ChartLine, smart_toy: Bot, summarize: FileText,
  table_rows: Table, timeline: Waypoints, tune: Settings2, verified: CircleCheck,
  visibility: Eye, menu_book: LibraryBig, checklist: CheckCheck, view_list: LayoutList,
  warning: AlertCircle, help: CircleHelp,
};

export function AdminIcon({ name, className = "" }: { name: string; className?: string }) {
  const Icon = icons[name] ?? CircleHelp;
  return <Icon size={18} aria-hidden="true" className={`inline-block shrink-0 align-middle ${className}`} />;
}

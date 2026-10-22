import ChatbotKbClient, { TriThucAiItem } from "./ChatbotKbClient";
import { backendRequest } from "@/libs/api-services/backend.server";
export const dynamic = "force-dynamic";
export default async function Page() {
  try { const result = await backendRequest<{ data: TriThucAiItem[] }>("ai", "/api/chat/knowledge", { auth: "admin" }); return <ChatbotKbClient initialData={result.data} />; }
  catch (e) { return <div><h1>Quản lý tri thức chatbot</h1><p role="alert">{e instanceof Error ? e.message : "Không tải được dữ liệu AI"}</p></div>; }
}

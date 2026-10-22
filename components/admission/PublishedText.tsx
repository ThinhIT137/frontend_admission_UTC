import { publishedContent } from "./admission-data";

export default function PublishedText({ content }: { content: string }) {
  const { text, links } = publishedContent(content);
  return <div className="space-y-3 break-words">
    <p className="whitespace-pre-wrap leading-relaxed">{text || "Chưa công bố nội dung."}</p>
    {links.length > 0 && <ul className="space-y-2">{links.map(link => <li key={link.href}>
      <a className="font-bold text-blue-800 underline" href={link.href} target="_blank" rel="noopener noreferrer">{link.label} ↗</a>
    </li>)}</ul>}
  </div>;
}

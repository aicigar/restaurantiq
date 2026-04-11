"use client";
import { useState } from "react";
import { ContentCalendarItem } from "@/types/social";

interface ContentCalendarProps {
  calendar: ContentCalendarItem[]
  restaurant_name: string
}

type Filter = "all" | "Instagram" | "TikTok" | "high" | "easy";

const VP_STYLE: Record<string, { color: string; bg: string }> = {
  high:   { color: "#E040FB", bg: "rgba(224,64,251,0.15)" },
  medium: { color: "#FFB547", bg: "rgba(255,181,71,0.12)" },
  low:    { color: "#8B9BB4", bg: "rgba(139,155,180,0.1)" },
};
const EF_STYLE: Record<string, { color: string }> = {
  easy:     { color: "#22C55E" },
  moderate: { color: "#FFB547" },
  hard:     { color: "#FF4D6D" },
};

export default function ContentCalendar({ calendar, restaurant_name }: ContentCalendarProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);

  const filtered = (calendar || []).filter((item) => {
    if (filter === "Instagram") return item.platform === "Instagram" || item.platform === "Both";
    if (filter === "TikTok") return item.platform === "TikTok" || item.platform === "Both";
    if (filter === "high") return item.viral_potential === "high";
    if (filter === "easy") return item.effort_level === "easy";
    return true;
  });

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBlock(key);
    setTimeout(() => setCopiedBlock(null), 1500);
  };

  const exportCSV = () => {
    const headers = ["Week","Day","Platform","Content Type","Format","Hook","Full Concept","What to Film","Caption Starter","Hashtags","Best Time to Post","Viral Potential","Effort Level","Why It Works","Call to Action"];
    const rows = (calendar || []).map((item) => [
      item.week, item.day, item.platform, item.content_type, item.format,
      item.hook, item.concept, item.what_to_film, item.caption_starter,
      (item.hashtags || []).join(" "), item.best_time_to_post,
      item.viral_potential, item.effort_level, item.why_this_will_perform, item.call_to_action,
    ].map((v) => `"${String(v || "").replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${restaurant_name.replace(/\s+/g, "-").toLowerCase()}-content-calendar.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyFullCalendar = () => {
    const text = (calendar || []).map((item) =>
      `Week ${item.week} — ${item.day} | ${item.platform}\n` +
      `Type: ${item.content_type} (${item.format})\n` +
      `Hook: ${item.hook}\n` +
      `Caption: ${item.caption_starter}\n` +
      `Post at: ${item.best_time_to_post}\n`
    ).join("\n---\n");
    copy(text, "full");
  };

  const rowBg = (item: ContentCalendarItem) => {
    if (item.platform === "Instagram") return "rgba(224,64,251,0.04)";
    if (item.platform === "TikTok") return "rgba(255,64,129,0.04)";
    return "rgba(255,181,71,0.03)";
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(["all","Instagram","TikTok","high","easy"] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
            style={filter === f
              ? { background: "rgba(224,64,251,0.15)", color: "#E040FB", border: "1px solid rgba(224,64,251,0.35)" }
              : { color: "#4B5A75", border: "1px solid rgba(30,45,74,0.8)" }}>
            {f === "all" ? "All" : f === "high" ? "High Viral Potential" : f === "easy" ? "Easy Only" : f}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-600 self-center">{filtered.length} entries</span>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden mb-4" style={{ border: "1px solid #1E2D4A" }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: "rgba(15,22,38,0.9)" }}>
              {["Week","Day","Platform","Type","Hook","Viral","Effort",""].map((h) => (
                <th key={h} className="text-left text-xs text-gray-500 uppercase tracking-wide px-3 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => {
              const isExpanded = expanded === i;
              const vp = VP_STYLE[item.viral_potential] || VP_STYLE.low;
              const ef = EF_STYLE[item.effort_level] || EF_STYLE.moderate;
              return (
                <>
                  <tr key={i}
                    className="border-t border-brd/40 cursor-pointer hover:bg-white/[0.02] transition-colors"
                    style={{ background: rowBg(item) }}
                    onClick={() => setExpanded(isExpanded ? null : i)}>
                    <td className="px-3 py-3 text-white font-bold text-xs">{item.week}</td>
                    <td className="px-3 py-3 text-gray-300 text-xs">{item.day}</td>
                    <td className="px-3 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ color: item.platform === "TikTok" ? "#FF4081" : "#E040FB", background: item.platform === "TikTok" ? "rgba(255,64,129,0.1)" : "rgba(224,64,251,0.1)" }}>
                        {item.platform}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-400 text-xs max-w-[100px] truncate">{item.content_type}</td>
                    <td className="px-3 py-3 text-gray-300 text-xs max-w-[180px]">
                      <span className="line-clamp-1">{item.hook}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ color: vp.color, background: vp.bg }}>
                        {item.viral_potential}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-semibold" style={{ color: ef.color }}>
                        {item.effort_level}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-xs">{isExpanded ? "▲" : "▼"}</td>
                  </tr>
                  {isExpanded && (
                    <tr key={`expand-${i}`} style={{ background: "rgba(22,32,56,0.5)" }}>
                      <td colSpan={8} className="px-5 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Full Concept</div>
                            <div className="text-gray-300 text-xs mb-3">{item.concept}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">What to Film</div>
                            <div className="text-gray-300 text-xs mb-3">{item.what_to_film}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Why It Will Perform</div>
                            <div className="text-xs italic" style={{ color: "#A78BFA" }}>{item.why_this_will_perform}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Caption Starter</div>
                            <div className="rounded-lg p-3 text-xs text-gray-300 mb-2 relative"
                              style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(30,45,74,0.8)", fontFamily: "monospace" }}>
                              {item.caption_starter}
                              <button
                                onClick={(e) => { e.stopPropagation(); copy(item.caption_starter, `cap-${i}`); }}
                                className="absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded"
                                style={{ color: "#E040FB", background: "rgba(224,64,251,0.1)" }}>
                                {copiedBlock === `cap-${i}` ? "✓" : "Copy"}
                              </button>
                            </div>
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Hashtags</div>
                              <button
                                onClick={(e) => { e.stopPropagation(); copy((item.hashtags || []).join(" "), `tags-${i}`); }}
                                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{ color: "#E040FB", background: "rgba(224,64,251,0.1)" }}>
                                {copiedBlock === `tags-${i}` ? "✓ Copied" : "Copy All"}
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {(item.hashtags || []).map((h, j) => (
                                <span key={j} className="text-xs px-2 py-0.5 rounded-full"
                                  style={{ color: "#E040FB", background: "rgba(224,64,251,0.08)" }}>{h}</span>
                              ))}
                            </div>
                            <div className="mt-3 text-xs">
                              <span className="text-gray-500">Best time: </span>
                              <span className="text-amber font-semibold">{item.best_time_to_post}</span>
                              <span className="mx-2 text-brd">·</span>
                              <span className="text-gray-500">CTA: </span>
                              <span className="text-teal">{item.call_to_action}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Export buttons */}
      <div className="flex gap-3">
        <button onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg,#E040FB,#A855F7)", boxShadow: "0 2px 10px rgba(224,64,251,0.25)" }}>
          📥 Export as CSV
        </button>
        <button onClick={copyFullCalendar}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all hover:-translate-y-0.5"
          style={{ background: "rgba(224,64,251,0.1)", color: "#E040FB", border: "1px solid rgba(224,64,251,0.3)" }}>
          {copiedBlock === "full" ? "✓ Copied!" : "📋 Copy Full Calendar"}
        </button>
      </div>
    </div>
  );
}

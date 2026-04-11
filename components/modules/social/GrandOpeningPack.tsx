"use client";
import { useState } from "react";
import { GrandOpeningPackData } from "@/types/social";

interface GrandOpeningPackProps {
  pack: GrandOpeningPackData
}

export default function GrandOpeningPack({ pack }: GrandOpeningPackProps) {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState<number | null>(null);

  if (!pack?.include) return null;

  const copy = (text: string, cb: (v: any) => void, val: any) => {
    navigator.clipboard.writeText(text);
    cb(val);
    setTimeout(() => cb(typeof val === "boolean" ? false : null), 1500);
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg,#0F1626,#162038)", border: "1px solid rgba(224,64,251,0.35)" }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3"
        style={{ background: "rgba(224,64,251,0.08)", borderBottom: "1px solid rgba(224,64,251,0.25)" }}>
        <span className="text-2xl">🎉</span>
        <div>
          <div className="font-black text-white text-base">Grand Opening Content Pack</div>
          <div className="text-gray-400 text-xs mt-0.5">Your complete pre-launch to opening day playbook</div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Pre-launch 7-day countdown */}
        {pack.pre_launch_7_days?.length > 0 && (
          <div>
            <div className="text-white font-bold text-sm mb-3">🗓 Pre-Launch Countdown (7 Days)</div>
            <div className="space-y-2">
              {pack.pre_launch_7_days.map((day, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 text-white"
                    style={{ background: "linear-gradient(135deg,#E040FB,#A855F7)" }}>
                    {day.day}
                  </div>
                  <div className="flex-1 rounded-xl p-3" style={{ background: "rgba(22,32,56,0.6)", border: "1px solid rgba(30,45,74,0.8)" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ color: "#E040FB", background: "rgba(224,64,251,0.1)" }}>
                        {day.platform}
                      </span>
                      <span className="text-xs text-gray-500">{day.content_type}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full ml-auto"
                        style={{ color: "#22C55E", background: "rgba(34,197,94,0.08)" }}>
                        {day.goal}
                      </span>
                    </div>
                    <div className="text-white font-semibold text-xs mb-1">{day.hook}</div>
                    <div className="text-gray-500 text-xs mb-2">{day.concept}</div>
                    <div className="relative rounded-lg p-2"
                      style={{ background: "rgba(11,17,32,0.6)", fontFamily: "monospace", border: "1px solid rgba(30,45,74,0.6)" }}>
                      <div className="text-xs text-gray-300 pr-10">{day.caption}</div>
                      <button onClick={() => copy(day.caption, setCopiedCaption, i)}
                        className="absolute top-1.5 right-2 text-xs font-semibold px-1.5 py-0.5 rounded"
                        style={{ color: "#E040FB", background: "rgba(224,64,251,0.1)" }}>
                        {copiedCaption === i ? "✓" : "⎘"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Opening day sequence */}
        {pack.opening_day_sequence?.length > 0 && (
          <div>
            <div className="text-white font-bold text-sm mb-3">🎊 Opening Day — Your Exact Playbook</div>
            <div className="space-y-2">
              {pack.opening_day_sequence.map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="rounded-lg px-2 py-1 text-center flex-shrink-0 min-w-[60px]"
                    style={{ background: "rgba(224,64,251,0.12)", border: "1px solid rgba(224,64,251,0.25)" }}>
                    <div className="text-xs font-bold" style={{ color: "#E040FB" }}>{item.time}</div>
                  </div>
                  <div className="flex-1 rounded-xl p-3" style={{ background: "rgba(22,32,56,0.6)", border: "1px solid rgba(30,45,74,0.8)" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ color: "#FF4081", background: "rgba(255,64,129,0.1)" }}>
                        {item.platform}
                      </span>
                      <span className="text-xs text-green">{item.goal}</span>
                    </div>
                    <div className="text-gray-300 text-xs">{item.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Promo script */}
        {pack.free_food_promo_announcement_script && (
          <div>
            <div className="text-white font-bold text-sm mb-2">📢 Free Food Promo Announcement Script</div>
            <div className="rounded-xl p-4 relative"
              style={{ background: "rgba(11,17,32,0.6)", border: "1px solid rgba(224,64,251,0.2)", fontFamily: "monospace" }}>
              <div className="text-xs text-gray-300 leading-relaxed pr-12">{pack.free_food_promo_announcement_script}</div>
              <button onClick={() => copy(pack.free_food_promo_announcement_script, setCopiedScript, true)}
                className="absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded"
                style={{ color: "#E040FB", background: "rgba(224,64,251,0.1)" }}>
                {copiedScript ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {/* Queue strategy */}
        {pack.queue_video_strategy && (
          <div className="rounded-xl p-4" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <div className="text-xs font-bold text-green mb-1">📹 Queue Video Strategy</div>
            <div className="text-gray-300 text-xs leading-relaxed">{pack.queue_video_strategy}</div>
          </div>
        )}

        {/* Post-launch week 1 */}
        {pack.post_launch_week_1?.length > 0 && (
          <div>
            <div className="text-white font-bold text-sm mb-2">✅ Post-Launch Week 1 Checklist</div>
            <div className="space-y-1.5">
              {pack.post_launch_week_1.map((action, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                  <div className="w-4 h-4 rounded border flex-shrink-0 mt-0.5"
                    style={{ border: "2px solid rgba(224,64,251,0.4)" }} />
                  {action}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

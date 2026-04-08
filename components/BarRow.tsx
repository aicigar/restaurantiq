"use client";
import { useEffect, useState } from "react";

interface BarRowProps {
  label: string;
  score: number;
  value?: string;
  note?: string;
}

export default function BarRow({ label, score, value, note }: BarRowProps) {
  const [width, setWidth] = useState(0);
  const pct = (score / 10) * 100;

  const gradient =
    score >= 7
      ? "linear-gradient(90deg, #22C55E, #00C9A7)"
      : score >= 4
      ? "linear-gradient(90deg, #FF8C42, #FFB547)"
      : "linear-gradient(90deg, #FF4D6D, #FF6B35)";

  const textColor =
    score >= 7 ? "#22C55E" : score >= 4 ? "#FFB547" : "#FF4D6D";

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 150);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-sm text-gray-300">{label}</span>
        <span className="text-sm font-bold" style={{ color: textColor }}>
          {score}/10{value ? ` — ${value}` : ""}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(30,45,74,0.8)" }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, background: gradient }}
        />
      </div>
      {note && <p className="text-xs text-gray-500 mt-1">{note}</p>}
    </div>
  );
}

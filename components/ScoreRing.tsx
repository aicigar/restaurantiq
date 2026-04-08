"use client";
import { useEffect, useState } from "react";

interface ScoreRingProps {
  score: number;
  size?: number;
}

export default function ScoreRing({ score, size = 72 }: ScoreRingProps) {
  const [animated, setAnimated] = useState(false);
  const r = size * 0.4;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = animated ? (score / 100) * circ : 0;

  const color = score >= 75 ? "#22C55E" : score >= 50 ? "#FFB547" : "#FF4D6D";

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#232F4A" strokeWidth={size * 0.08} />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={size * 0.08}
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
      <text
        x={cx}
        y={cy - size * 0.04}
        textAnchor="middle"
        fill={color}
        fontSize={size * 0.24}
        fontWeight="700"
        fontFamily="inherit"
      >
        {score}
      </text>
      <text
        x={cx}
        y={cy + size * 0.16}
        textAnchor="middle"
        fill="#8B9BB4"
        fontSize={size * 0.13}
        fontFamily="inherit"
      >
        /100
      </text>
    </svg>
  );
}

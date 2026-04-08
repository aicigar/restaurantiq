interface ThreatBadgeProps {
  level: "low" | "medium" | "high";
}

const styles = {
  high: { bg: "bg-coral/10", text: "text-coral", border: "border-coral/30", label: "HIGH THREAT" },
  medium: { bg: "bg-amber/10", text: "text-amber", border: "border-amber/30", label: "MEDIUM THREAT" },
  low: { bg: "bg-green/10", text: "text-green", border: "border-green/30", label: "LOW THREAT" },
};

export default function ThreatBadge({ level }: ThreatBadgeProps) {
  const s = styles[level] || styles.low;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${s.bg} ${s.text} ${s.border}`}>
      {s.label}
    </span>
  );
}

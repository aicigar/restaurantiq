"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface SidebarProps {
  activeModule: "location" | "reviews" | "competitors";
  onModuleChange: (module: "location" | "reviews" | "competitors") => void;
}

const modules = [
  { id: "location"    as const, icon: "📍", label: "Location Scorer",  color: "rgba(255,107,53,0.25)",  ring: "rgba(255,107,53,0.6)" },
  { id: "reviews"     as const, icon: "⭐", label: "Review Analyzer",   color: "rgba(0,201,167,0.2)",    ring: "rgba(0,201,167,0.6)"  },
  { id: "competitors" as const, icon: "🔍", label: "Competitor Radar",  color: "rgba(255,77,109,0.2)",   ring: "rgba(255,77,109,0.6)" },
];

export default function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  const router = useRouter();
  const supabase = createClient();

  const handlePortal = async () => {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex-shrink-0 flex flex-col items-center py-4 gap-2 border-r border-brd/60"
      style={{ width: 68, background: "linear-gradient(180deg, #0F1626 0%, #0A1020 100%)" }}>

      {/* Logo */}
      <button
        onClick={() => router.push("/")}
        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg mb-4"
        style={{ background: "linear-gradient(135deg, #FF6B35, #FFB547)", boxShadow: "0 4px 16px rgba(255,107,53,0.4)" }}
        title="Home"
      >
        R
      </button>

      {/* Module buttons */}
      {modules.map((m) => {
        const isActive = activeModule === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onModuleChange(m.id)}
            title={m.label}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all duration-200"
            style={isActive ? {
              background: m.color,
              boxShadow: `0 0 0 1px ${m.ring}`,
            } : {}}
          >
            <span style={{ filter: isActive ? "none" : "grayscale(60%) opacity(0.5)" }}>{m.icon}</span>
          </button>
        );
      })}

      <div className="flex-1" />

      {/* Bottom actions */}
      {[
        { icon: "📋", label: "Report History", action: () => router.push("/dashboard/history") },
        { icon: "👤", label: "My Account", action: () => router.push("/dashboard/account") },
        { icon: "⚙️", label: "Billing & Settings", action: handlePortal },
        { icon: "🚪", label: "Sign Out", action: handleSignOut },
      ].map((btn) => (
        <button
          key={btn.label}
          onClick={btn.action}
          title={btn.label}
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all duration-200 hover:bg-white/5"
          style={{ filter: "grayscale(40%) opacity(0.55)" }}
          onMouseEnter={(e) => (e.currentTarget.style.filter = "none")}
          onMouseLeave={(e) => (e.currentTarget.style.filter = "grayscale(40%) opacity(0.55)")}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
}

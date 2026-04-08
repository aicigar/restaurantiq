"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import LocationScorer from "@/components/modules/LocationScorer";
import ReviewAnalyzer from "@/components/modules/ReviewAnalyzer";
import CompetitorRadar from "@/components/modules/CompetitorRadar";

type Module = "location" | "reviews" | "competitors";

export default function DashboardPage() {
  const [activeModule, setActiveModule] = useState<Module>("location");

  return (
    <div className="flex h-screen overflow-hidden bg-navy">
      <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
      <div className="flex-1 overflow-hidden">
        {activeModule === "location" && <LocationScorer />}
        {activeModule === "reviews" && <ReviewAnalyzer />}
        {activeModule === "competitors" && <CompetitorRadar />}
      </div>
    </div>
  );
}

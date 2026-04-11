"use client";
import { useState } from "react";
import { buildTextReport } from "@/lib/reports/text";
import { buildHTMLReport } from "@/lib/reports/html";

interface ExportToolbarProps {
  result: any;
  module: string;
  reportId?: string;
}

export default function ExportToolbar({ result, module, reportId }: ExportToolbarProps) {
  const [emailModal, setEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const downloadText = (content: string, filename: string, type = "text/plain") => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const titleSlug = () => {
    const title = result.location_name || result.restaurant_name || result.location || "report";
    return title.replace(/[^a-z0-9]/gi, "-").toLowerCase();
  };

  const handlePDF = async () => {
    const { buildPDFReport } = await import("@/lib/reports/pdf");
    const doc = buildPDFReport(result, module);
    doc.save(`restaurantiq-${module}-${titleSlug()}.pdf`);
  };

  const handleHTML = () => {
    const html = buildHTMLReport(result, module);
    downloadText(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>RestaurantIQ Report</title></head><body style="background:#080D1A;margin:0;padding:20px;font-family:Arial,sans-serif;">${html}</body></html>`,
      `restaurantiq-${module}-${titleSlug()}.html`,
      "text/html"
    );
  };

  const handleTXT = () => downloadText(buildTextReport(result, module), `restaurantiq-${module}-${titleSlug()}.txt`);
  const handleJSON = () => downloadText(JSON.stringify(result, null, 2), `restaurantiq-${module}-${titleSlug()}.json`, "application/json");

  const handleGoogleDocs = () => {
    navigator.clipboard.writeText(buildTextReport(result, module)).then(() => {
      showToast("Copied! Paste into Google Docs (Ctrl+V)");
    });
  };

  const handlePreview = () => {
    const html = buildHTMLReport(result, module);
    const full = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>RestaurantIQ Report</title></head><body style="background:#080D1A;margin:0;padding:20px;font-family:Arial,sans-serif;">${html}</body></html>`;
    window.open(URL.createObjectURL(new Blob([full], { type: "text/html" })), "_blank");
  };

  const handleEmailSend = async () => {
    if (!emailTo) return;
    if (!reportId) {
      setEmailStatus("Report ID missing — please re-run the analysis and try again.");
      return;
    }
    setEmailSending(true);
    setEmailStatus("");
    const title = result.location_name || result.restaurant_name || result.location || "Report";
    const res = await fetch("/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: emailTo,
        subject: `RestaurantIQ ${module.charAt(0).toUpperCase() + module.slice(1)} Report — ${title}`,
        reportId,
      }),
    });
    const data = await res.json();
    setEmailSending(false);
    if (data.success) {
      setEmailStatus("Sent!");
      setTimeout(() => { setEmailModal(false); setEmailStatus(""); setEmailTo(""); }, 1500);
    } else {
      setEmailStatus(data.error || "Failed to send");
    }
  };

  const buttons = [
    { label: "📄 PDF",     action: handlePDF,          grad: "linear-gradient(135deg,#FF6B35,#FFB547)", glow: "rgba(255,107,53,0.25)" },
    { label: "🌐 HTML",    action: handleHTML,         grad: "linear-gradient(135deg,#00C9A7,#00A8E0)", glow: "rgba(0,201,167,0.2)" },
    { label: "📝 TXT",     action: handleTXT,          grad: "linear-gradient(135deg,#8B9BB4,#5A6880)", glow: "rgba(139,155,180,0.15)" },
    { label: "{ } JSON",   action: handleJSON,         grad: "linear-gradient(135deg,#7C6FFF,#A855F7)", glow: "rgba(124,111,255,0.2)" },
    { label: "📋 Docs",    action: handleGoogleDocs,   grad: "linear-gradient(135deg,#FFB547,#FF8C42)", glow: "rgba(255,181,71,0.2)" },
    { label: "👁 Preview", action: handlePreview,      grad: "linear-gradient(135deg,#5A6880,#3D5070)", glow: "rgba(90,104,128,0.15)" },
    { label: "✉ Email",   action: () => setEmailModal(true), grad: "linear-gradient(135deg,#FF4D6D,#FF6B35)", glow: "rgba(255,77,109,0.25)" },
  ];

  return (
    <>
      <div className="border-t border-brd/60 px-4 py-3 flex items-center gap-2 flex-wrap"
        style={{ background: "linear-gradient(180deg, #0F1626, #0A1020)" }}>
        {buttons.map((b) => (
          <button
            key={b.label}
            onClick={b.action}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition-all hover:-translate-y-0.5"
            style={{ background: b.grad, boxShadow: `0 2px 10px ${b.glow}` }}
          >
            {b.label}
          </button>
        ))}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-white text-sm px-5 py-3 rounded-xl shadow-xl z-50 border border-brd/60"
          style={{ background: "linear-gradient(135deg, #0F1626, #162038)" }}>
          {toast}
        </div>
      )}

      {emailModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl p-6 w-full max-w-md border border-brd/60"
            style={{ background: "linear-gradient(145deg, #0F1626, #162038)" }}>
            <h3 className="text-white font-bold text-lg mb-4">Email Report</h3>
            <input
              type="email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              placeholder="recipient@example.com"
              className="input-field w-full px-4 py-3 mb-3"
            />
            {emailStatus && (
              <p className={`text-sm mb-3 ${emailStatus === "Sent!" ? "text-green" : "text-coral"}`}>{emailStatus}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleEmailSend}
                disabled={emailSending || !emailTo}
                className="flex-1 btn-orange text-white font-semibold py-2.5 rounded-xl disabled:opacity-40"
              >
                {emailSending ? "Sending..." : "Send Report"}
              </button>
              <button
                onClick={() => setEmailModal(false)}
                className="px-5 py-2.5 border border-brd/60 text-gray-400 hover:text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

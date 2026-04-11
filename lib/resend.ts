import { Resend } from "resend";
import { buildHTMLReport } from "@/lib/reports/html";
import { buildTextReport } from "@/lib/reports/text";

export async function sendReportEmail(
  to: string,
  subject: string,
  reportData: any,
  module: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Email service not configured. Please contact support.");

  const resend = new Resend(apiKey);
  const htmlContent = buildHTMLReport(reportData, module);
  const textContent = buildTextReport(reportData, module);

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:'DM Sans',Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;">
        <div style="background:#0B1120;padding:24px 32px;text-align:center;">
          <div style="display:inline-flex;align-items:center;gap:10px;">
            <div style="width:38px;height:38px;background:#FF6B35;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-weight:800;color:white;font-size:20px;">R</div>
            <span style="color:white;font-size:20px;font-weight:700;">RestaurantIQ</span>
          </div>
          <p style="color:#8B9BB4;margin:8px 0 0;">Your AI-Powered Restaurant Intelligence Report</p>
        </div>
        <div style="padding:32px;">${htmlContent}</div>
        <div style="background:#0B1120;padding:16px 32px;text-align:center;">
          <p style="color:#4B5563;margin:0;font-size:12px;">© 2026 RestaurantIQ. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await resend.emails.send({
    from: "RestaurantIQ <onboarding@resend.dev>",
    to,
    subject,
    html: emailHtml,
    text: textContent,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendReportEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const { to, subject, reportId } = await req.json();
    if (!to || !subject || !reportId) {
      return NextResponse.json({ error: "to, subject, and reportId are required", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("*")
      .eq("id", reportId)
      .eq("user_id", user.id)
      .single();

    if (reportError || !report) {
      return NextResponse.json({ error: "Report not found", code: "NOT_FOUND" }, { status: 404 });
    }

    await sendReportEmail(to, subject, report.result_data, report.module);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Email send error:", err);
    return NextResponse.json({ error: err.message || "Internal server error", code: "API_ERROR" }, { status: 500 });
  }
}

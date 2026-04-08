import { createClient } from "@/lib/supabase/server";
import { PLAN_LIMITS } from "@/lib/stripe";

export interface UsageResult {
  allowed: boolean;
  used: number;
  limit: number;
  plan: string;
}

export async function checkUsageLimit(userId: string): Promise<UsageResult> {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("plan, reports_used_this_month, reports_reset_date")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    throw new Error("Profile not found");
  }

  // Reset counter if it's a new month
  const resetDate = new Date(profile.reports_reset_date);
  const now = new Date();
  const isNewMonth =
    resetDate.getMonth() !== now.getMonth() ||
    resetDate.getFullYear() !== now.getFullYear();

  if (isNewMonth) {
    await supabase
      .from("profiles")
      .update({
        reports_used_this_month: 0,
        reports_reset_date: now.toISOString().split("T")[0],
      })
      .eq("id", userId);
    profile.reports_used_this_month = 0;
  }

  const limit = PLAN_LIMITS[profile.plan] ?? 0;
  const used = profile.reports_used_this_month;
  const allowed = used < limit;

  return {
    allowed,
    used,
    limit: limit === Infinity ? -1 : limit,
    plan: profile.plan,
  };
}

export async function incrementUsage(userId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc("increment_reports_used", { user_id: userId });
}

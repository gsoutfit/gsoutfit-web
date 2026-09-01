import { NextRequest, NextResponse } from "next/server";
import { getAnalytics } from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireAdmin(request);
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") as "7d" | "30d" | "3m" | "6m" | "1y") || "30d";
    const analytics = await getAnalytics(period);
    return NextResponse.json({ success: true, data: analytics });
  } catch (error) {
    console.error("Analytics GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch real analytics" },
      { status: 500 }
    );
  }
}

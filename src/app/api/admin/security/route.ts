import { NextRequest, NextResponse } from "next/server";
import { getActivityLogs, getLoginHistory } from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireAdmin(request);
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    const activityLogs = await getActivityLogs();
    const loginHistory = await getLoginHistory();
    return NextResponse.json({
      success: true,
      data: {
        activityLogs,
        loginHistory,
      },
    });
  } catch (error) {
    console.error("Admin security logs error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch security logs" },
      { status: 500 }
    );
  }
}

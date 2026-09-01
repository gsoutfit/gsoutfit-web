import { NextRequest, NextResponse } from "next/server";
import { getMailLogs, clearMailLogs } from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const logs = await getMailLogs();
    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    console.error("Mail logs fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve mail logs." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    await clearMailLogs();
    return NextResponse.json({ success: true, message: "Mail logs cleared successfully." });
  } catch (error: any) {
    console.error("Mail logs delete error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to clear mail logs." },
      { status: 500 }
    );
  }
}

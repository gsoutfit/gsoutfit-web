import { NextRequest, NextResponse } from "next/server";
import { resetThemeSettings } from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const settings = await resetThemeSettings();
    return NextResponse.json({
      success: true,
      message: "Theme reset to default Gentlemen Savage palette",
      data: settings,
    });
  } catch (error: any) {
    console.error("Theme reset error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset theme settings." },
      { status: 500 }
    );
  }
}

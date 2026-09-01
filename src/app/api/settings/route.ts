import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/db";
import { requireAdmin, getSessionUser } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  try {
    const settings = await getSettings();
    // Mask sensitive SMTP credentials in any response
    const sanitized = {
      ...settings,
      smtp: settings.smtp
        ? {
            ...settings.smtp,
            pass: settings.smtp.pass ? "••••••••" : "",
          }
        : undefined,
    };

    // Full config (security flags, SMTP host/user) only for admins. The
    // storefront (ThemeContext) only needs appearance/store/marketing data.
    const user = await getSessionUser(request);
    if (user?.role !== "admin") {
      const { security: _security, smtp: _smtp, ...publicSettings } = sanitized;
      return NextResponse.json({ success: true, data: publicSettings });
    }

    return NextResponse.json({ success: true, data: sanitized });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authCheck = await requireAdmin(request);
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    const body = await request.json();

    // Preserve existing SMTP password if user submitted masked dots
    if (body.smtp && body.smtp.pass === "••••••••") {
      const current = await getSettings();
      body.smtp.pass = current.smtp?.pass || "";
    }

    const updated = await updateSettings(body);
    const sanitized = {
      ...updated,
      smtp: updated.smtp
        ? {
            ...updated.smtp,
            pass: updated.smtp.pass ? "••••••••" : "",
          }
        : undefined,
    };

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      data: sanitized,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { sendEmail, getTestEmailTemplate } from "@/lib/mail";
import { requireAdmin } from "@/lib/server-auth";
import { checkRateLimit } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateCheck = checkRateLimit(`mail_test:${clientIp}`, 5, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many test email requests. Please wait a few minutes." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { to } = body;

    const cleanTo = (to || "").trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!cleanTo || !emailRegex.test(cleanTo)) {
      return NextResponse.json(
        { success: false, message: "Valid recipient email address is required" },
        { status: 400 }
      );
    }

    const { html, text } = getTestEmailTemplate(cleanTo);
    const result = await sendEmail({
      to: cleanTo,
      subject: "Gentlemen Savage Mail Engine — Connectivity Test",
      html,
      previewText: text,
      type: "test",
    });

    return NextResponse.json({
      success: result.success,
      message: result.message,
      mode: result.mode,
      log: result.log,
    });
  } catch (error: any) {
    console.error("Test email error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send test email" },
      { status: 500 }
    );
  }
}

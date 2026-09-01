import { NextRequest, NextResponse } from "next/server";
import { findUserByEmailOrUsername, setVerificationCode } from "@/lib/db";
import { sendEmail, getAdminVerificationEmailTemplate } from "@/lib/mail";
import { checkRateLimit } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const body = await request.json().catch(() => ({}));
    const { email, username } = body;

    const identifier = (email || username || "").toString().trim();
    if (!identifier) {
      return NextResponse.json(
        { success: false, message: "Email or username is required." },
        { status: 400 }
      );
    }

    // Rate limit resend requests: max 2 requests per 5 minutes per identifier
    const rateCheck = checkRateLimit(`resend_otp:${identifier.toLowerCase()}:${clientIp}`, 2, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Please wait ${rateCheck.retryAfterSeconds} seconds before requesting another code.`,
        },
        { status: 429 }
      );
    }

    const user = await findUserByEmailOrUsername(identifier);
    if (!user) {
      // Return generic 200 response to prevent identifier enumeration
      return NextResponse.json({
        success: true,
        message: "If an administrative account matches this identifier, a code has been dispatched.",
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    await setVerificationCode(user.email, otpCode, expiresAt);

    const { html, text } = getAdminVerificationEmailTemplate(
      user.name,
      user.username || "Resol",
      otpCode
    );

    const mailResult = await sendEmail({
      to: user.email,
      subject: `🔑 Gentlemen Savage — New Admin Verification Code [${otpCode}]`,
      html,
      previewText: text,
      otpCode,
      type: "verification",
    });

    return NextResponse.json({
      success: true,
      message: `A fresh 6-digit verification code has been dispatched to ${user.email}.`,
      mailMode: mailResult.mode,
      devOtpCode:
        process.env.NODE_ENV !== "production" && mailResult.mode === "dev_preview"
          ? otpCode
          : undefined,
    });
  } catch (error: any) {
    console.error("Resend code error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to dispatch verification code." },
      { status: 500 }
    );
  }
}

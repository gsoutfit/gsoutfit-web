import { NextRequest, NextResponse } from "next/server";
import { verifyUserCode, recordLogin } from "@/lib/db";
import { signSessionToken, checkRateLimit } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const body = await request.json().catch(() => ({}));
    const { email, username, code } = body;

    const identifier = (email || username || "").toString().trim();
    if (!identifier || !code) {
      return NextResponse.json(
        { success: false, message: "Email or username and verification code are required." },
        { status: 400 }
      );
    }

    // Rate-limit OTP attempts to prevent 6-digit brute-force
    const rateCheck = checkRateLimit(`otp_verify:${identifier.toLowerCase()}:${clientIp}`, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many invalid verification attempts. Please wait ${Math.ceil(
            rateCheck.retryAfterSeconds / 60
          )} minutes before trying again.`,
        },
        { status: 429 }
      );
    }

    const cleanCode = code.toString().trim();
    const result = await verifyUserCode(identifier, cleanCode);

    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get("user-agent") || "Browser";

    await recordLogin(
      result.user.email,
      result.user.role,
      "Success",
      clientIp,
      userAgent
    );

    const {
      passwordHash: _,
      passwordSalt: __,
      verificationCode: ___,
      ...safeUser
    } = result.user;

    const sessionToken = signSessionToken({
      id: result.user.id,
      role: result.user.role,
      email: result.user.email,
    });

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: `Admin verification complete. Welcome to Gentlemen Savage, ${safeUser.name}!`,
    });

    // Set cryptographically signed HttpOnly session cookie
    response.cookies.set("gs_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { success: false, message: "Verification process encountered an unexpected error." },
      { status: 500 }
    );
  }
}

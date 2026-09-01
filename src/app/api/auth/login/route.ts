import { NextRequest, NextResponse } from "next/server";
import { findUserByEmailOrUsername, recordLogin } from "@/lib/db";
import {
  verifyPassword,
  signSessionToken,
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginAttempts,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const identifier = (body.email || body.username || body.identifier || "").trim();
    const password = body.password;

    if (!identifier || !password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, message: "Valid username or email and password are required" },
        { status: 400 }
      );
    }

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Browser";
    const rateLimitKey = `${identifier.toLowerCase()}:${clientIp}`;

    // 1. Rate limiting enforcement
    const rateLimitCheck = checkLoginRateLimit(rateLimitKey);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many failed authentication attempts. Access locked for security. Please try again in ${rateLimitCheck.waitMinutes} minutes.`,
        },
        { status: 429 }
      );
    }

    // 2. User lookup
    const user = await findUserByEmailOrUsername(identifier);
    let isAuthenticated = false;

    if (user && user.passwordHash && user.passwordSalt) {
      isAuthenticated = verifyPassword(password, user.passwordHash, user.passwordSalt);
    }

    // 3. Failed authentication handling (constant-time response feel, generic message)
    if (!user || !isAuthenticated) {
      const failedResult = recordFailedLogin(rateLimitKey);
      await recordLogin(identifier, user?.role || "unknown", "Failed", clientIp, userAgent);

      let msg = "Invalid username/email or password credentials.";
      if (failedResult.lockedOut) {
        msg = "Too many failed attempts. Account authentication temporarily locked for 15 minutes.";
      }
      return NextResponse.json({ success: false, message: msg }, { status: 401 });
    }

    // 4. Admin verification requirement
    if (user.role === "admin" && user.isVerified === false) {
      return NextResponse.json(
        {
          success: false,
          requiresVerification: true,
          email: user.email,
          username: user.username,
          message: "Admin account is pending email verification. Please submit your 6-digit verification code.",
        },
        { status: 403 }
      );
    }

    // 5. Successful login
    resetLoginAttempts(rateLimitKey);
    await recordLogin(user.email, user.role, "Success", clientIp, userAgent);

    const {
      passwordHash: _,
      passwordSalt: __,
      verificationCode: ___,
      ...safeUser
    } = user;

    const sessionToken = signSessionToken({
      id: user.id,
      role: user.role,
      email: user.email,
    });

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: `Welcome back, ${safeUser.name}!`,
    });

    // Set secure, HttpOnly, SameSite session cookie
    response.cookies.set("gs_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Authentication service encountered an unexpected error." },
      { status: 500 }
    );
  }
}

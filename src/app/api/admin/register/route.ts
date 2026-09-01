import { NextRequest, NextResponse } from "next/server";
import { getDb, findUserByEmailOrUsername, createUser, setVerificationCode } from "@/lib/db";
import { hashPassword, checkRateLimit } from "@/lib/auth";
import { sendEmail, getAdminVerificationEmailTemplate } from "@/lib/mail";

export async function POST(request: NextRequest) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    // 1. Rate limit registration attempts (max 3 admin registrations per hour per IP)
    const rateCheck = checkRateLimit(`admin_reg:${clientIp}`, 3, 60 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many administrative registration attempts. Please try again in ${Math.ceil(
            rateCheck.retryAfterSeconds / 60
          )} minutes.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { name, username, email, password, adminSecretKey } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const cleanUsername = (username || "Resol").trim().replace(/[^a-zA-Z0-9_-]/g, "");
    const cleanEmail = email.toLowerCase().trim();

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check if registration is allowed or secret key check
    const isRegistrationAllowed = db.settings?.security?.adminRegistrationAllowed ?? true;
    if (!isRegistrationAllowed) {
      const requiredKey = db.settings?.security?.adminSecretKey;
      if (!requiredKey || adminSecretKey !== requiredKey) {
        return NextResponse.json(
          { success: false, message: "Admin registration requires a valid administrative passkey." },
          { status: 403 }
        );
      }
    }

    // Check for existing user by email or username
    const existing = await findUserByEmailOrUsername(cleanEmail);
    const existingUsername = await findUserByEmailOrUsername(cleanUsername);

    if (existing) {
      return NextResponse.json(
        { success: false, message: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    if (existingUsername) {
      return NextResponse.json(
        { success: false, message: `Username '${cleanUsername}' is already in use.` },
        { status: 409 }
      );
    }

    const { hash, salt } = hashPassword(password);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    // Create new unverified admin user
    const newUser = await createUser({
      name: name.trim().replace(/<[^>]*>?/gm, ""),
      username: cleanUsername,
      email: cleanEmail,
      passwordHash: hash,
      passwordSalt: salt,
      role: "admin",
      isVerified: false,
      verificationCode: otpCode,
      verificationExpiresAt: expiresAt,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        name
      )}&backgroundColor=0b0b0c,18181c&textColor=d4af37`,
    });

    const { html, text } = getAdminVerificationEmailTemplate(
      name,
      cleanUsername,
      otpCode
    );

    const mailResult = await sendEmail({
      to: cleanEmail,
      subject: `🔑 Gentlemen Savage — Admin Portal Verification Code [${otpCode}]`,
      html,
      previewText: text,
      otpCode,
      type: "verification",
    });

    return NextResponse.json({
      success: true,
      message: `Registration initiated. A 6-digit verification code has been dispatched to ${cleanEmail}.`,
      mailMode: mailResult.mode,
      requiresVerification: true,
      email: cleanEmail,
      username: cleanUsername,
      devOtpCode:
        process.env.NODE_ENV !== "production" && mailResult.mode === "dev_preview"
          ? otpCode
          : undefined,
    });
  } catch (error: any) {
    console.error("Admin registration error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process administrative registration." },
      { status: 500 }
    );
  }
}

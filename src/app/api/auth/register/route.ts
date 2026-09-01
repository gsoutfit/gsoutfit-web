import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, createUser, recordLogin } from "@/lib/db";
import { hashPassword, signSessionToken, checkRateLimit } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    // 1. Rate limiting on registration (max 5 accounts per 15 mins per IP)
    const rateCheck = checkRateLimit(`reg:${clientIp}`, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many account registrations from this IP address. Please try again in ${Math.ceil(
            rateCheck.retryAfterSeconds / 60
          )} minutes.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { name, email, password, phone } = body;

    // 2. Strict Input Validation
    if (!name || typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80) {
      return NextResponse.json(
        { success: false, message: "A valid name between 2 and 80 characters is required." },
        { status: 400 }
      );
    }

    const cleanEmail = (email || "").toString().toLowerCase().trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters in length." },
        { status: 400 }
      );
    }

    // 3. Existing user check
    const existing = await findUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { success: false, message: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    // 4. Strong Password Hashing
    const { hash, salt } = hashPassword(password);
    const cleanName = name.replace(/<[^>]*>?/gm, "").trim();

    // 5. Create user strictly with role: "customer"
    const newUser = await createUser({
      name: cleanName,
      email: cleanEmail,
      passwordHash: hash,
      passwordSalt: salt,
      role: "customer",
      phone: typeof phone === "string" ? phone.trim().slice(0, 30) : "",
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        cleanName
      )}&backgroundColor=0b0b0c,18181c&textColor=d4af37`,
      addresses: [],
    });

    const userAgent = request.headers.get("user-agent") || "Browser";
    await recordLogin(cleanEmail, "customer", "Success", clientIp, userAgent);

    const {
      passwordHash: _,
      passwordSalt: __,
      verificationCode: ___,
      ...safeUser
    } = newUser;

    const sessionToken = signSessionToken({
      id: newUser.id,
      role: newUser.role,
      email: newUser.email,
    });

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: "Account created successfully! Welcome to Gentlemen Savage.",
    });

    response.cookies.set("gs_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, message: "Registration service encountered an error." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, updateAdminPassword, recordLogin } from "@/lib/db";
import { verifyPassword, checkRateLimit } from "@/lib/auth";
import { getSessionUser } from "@/lib/server-auth";

export async function POST(request: NextRequest) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Browser";

    // 1. Rate limiting (max 5 password change attempts per 15 minutes per IP)
    const rateCheck = checkRateLimit(`pwd_change:${clientIp}`, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many password change attempts. Please try again in ${Math.ceil(
            rateCheck.retryAfterSeconds / 60
          )} minutes.`,
        },
        { status: 429 }
      );
    }

    // 2. Enforce active admin session
    const sessionUser = await getSessionUser(request);
    if (!sessionUser || sessionUser.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Access denied. Active administrator session required." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { email, currentPassword, newPassword } = body;

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Email, current password, and new password are required." },
        { status: 400 }
      );
    }

    // Ensure administrator can only change their own password unless super-admin
    if (sessionUser.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. You may only update your own password." },
        { status: 403 }
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Administrator account not found." },
        { status: 404 }
      );
    }

    // Verify current password against stored PBKDF2 hash
    let isCurrentValid = false;
    if (user.passwordHash && user.passwordSalt) {
      isCurrentValid = verifyPassword(currentPassword, user.passwordHash, user.passwordSalt);
    }

    if (!isCurrentValid) {
      await recordLogin(email, "admin", "Failed", clientIp, `Password change failed: ${userAgent}`);
      return NextResponse.json(
        { success: false, error: "Current password verification failed." },
        { status: 401 }
      );
    }

    const updated = await updateAdminPassword(user.id, newPassword);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Failed to update administrator password in database." },
        { status: 500 }
      );
    }

    await recordLogin(email, "admin", "Success", clientIp, "Password changed successfully");

    return NextResponse.json({
      success: true,
      message: "Administrator password updated successfully.",
    });
  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process password change request." },
      { status: 500 }
    );
  }
}

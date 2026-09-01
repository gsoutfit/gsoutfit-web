import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "./auth";
import { getUserById } from "./users-db";
import { User } from "@/types";

export interface AuthenticatedSession {
  user: Omit<User, "passwordHash" | "passwordSalt" | "verificationCode">;
}

/**
 * Extracts and verifies the authenticated user from the signed session cookie or authorization header.
 */
export async function getSessionUser(
  request: NextRequest
): Promise<Omit<User, "passwordHash" | "passwordSalt" | "verificationCode"> | null> {
  try {
    const sessionCookie = request.cookies.get("gs_session")?.value;
    const authHeader = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const token = sessionCookie || authHeader;

    if (!token) return null;

    const payload = verifySessionToken(token);
    if (!payload || !payload.id) return null;

    const user = await getUserById(payload.id);
    if (!user) return null;

    // Verify role matches stored database record to prevent client-side privilege escalation
    if (payload.role && payload.role !== user.role) {
      return null;
    }

    const {
      passwordHash: _,
      passwordSalt: __,
      verificationCode: ___,
      ...safeUser
    } = user;

    return safeUser;
  } catch (err) {
    console.error("Session verification error:", err);
    return null;
  }
}

/**
 * Enforces that a valid user is logged in.
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: Omit<User, "passwordHash" | "passwordSalt" | "verificationCode"> } | NextResponse> {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Authentication required. Please sign in." },
      { status: 401 }
    );
  }
  return { user };
}

/**
 * Enforces that an authenticated administrator is making the request.
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ user: Omit<User, "passwordHash" | "passwordSalt" | "verificationCode"> } | NextResponse> {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Authentication required. Please sign in as an administrator." },
      { status: 401 }
    );
  }

  if (user.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Access denied. Administrator privileges required." },
      { status: 403 }
    );
  }

  return { user };
}

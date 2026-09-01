import { NextRequest, NextResponse } from "next/server";

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "gs_production_secret_key_gentleman_savage_auth_signature_2026_unbreakable_salt";

// Web Crypto HMAC Verification compatible with Next.js Edge Runtime
async function verifyEdgeToken(token: string): Promise<{ id: string; role: string; email: string } | null> {
  try {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [payloadB64, signatureB64] = parts;

    // Convert Base64URL to Uint8Array
    const base64ToUint8Array = (b64url: string) => {
      const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
      const pad = b64.length % 4;
      const padded = pad ? b64 + "=".repeat(4 - pad) : b64;
      const bin = atob(padded);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) {
        bytes[i] = bin.charCodeAt(i);
      }
      return bytes;
    };

    const sigBytes = base64ToUint8Array(signatureB64);
    const dataBytes = new TextEncoder().encode(payloadB64);

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(SESSION_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, dataBytes);
    if (!isValid) return null;

    const payloadJson = new TextDecoder().decode(base64ToUint8Array(payloadB64));
    const payload = JSON.parse(payloadJson);

    if (!payload.id || !payload.role || !payload.exp) return null;
    if (Date.now() > payload.exp) return null; // Expired

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Admin Area Route Protection
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthPage =
    pathname === "/admin/login" ||
    pathname === "/admin/register" ||
    pathname === "/admin/verify";

  if (isAdminRoute) {
    const sessionCookie = request.cookies.get("gs_session")?.value;
    const session = sessionCookie ? await verifyEdgeToken(sessionCookie) : null;

    if (!isAuthPage) {
      // Protected admin dashboard pages
      if (!session || session.role !== "admin") {
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
      }
    } else {
      // If user is already an authenticated admin and visits /admin/login or register, redirect to /admin
      if (session && session.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
  }

  // 2. Security Headers Ingestion
  const response = NextResponse.next();

  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  // CSP: safe policies allowing Next.js dynamic assets, google fonts, and image CDNs
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https: http:",
    "connect-src 'self' https:",
    "frame-ancestors 'self'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (handled individually in route handlers)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt, sitemap.xml
     */
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

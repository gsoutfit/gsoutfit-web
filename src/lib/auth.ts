import crypto from "crypto";

const DEFAULT_ITERATIONS = 100000;
const LEGACY_ITERATIONS = 10000;
const KEYLEN = 64;
const DIGEST = "sha512";

// Server secret for signing session tokens
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "gs_production_secret_key_gentleman_savage_auth_signature_2026_unbreakable_salt";

export interface SessionPayload {
  id: string;
  role: string;
  email: string;
  iat: number;
  exp: number;
}

/**
 * Hash a plaintext password with a cryptographically secure salt.
 */
export function hashPassword(
  password: string,
  providedSalt?: string
): { hash: string; salt: string; iterations: number } {
  const salt = providedSalt || crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, DEFAULT_ITERATIONS, KEYLEN, DIGEST)
    .toString("hex");
  return { hash, salt, iterations: DEFAULT_ITERATIONS };
}

/**
 * Verify a plaintext password against a stored hash and salt (supports adaptive iterations).
 */
export function verifyPassword(
  password: string,
  storedHash: string,
  salt: string,
  iterations: number = DEFAULT_ITERATIONS
): boolean {
  try {
    // Try primary iteration count
    let hash = crypto
      .pbkdf2Sync(password, salt, iterations, KEYLEN, DIGEST)
      .toString("hex");
    let hashBuffer = Buffer.from(hash, "hex");
    let storedBuffer = Buffer.from(storedHash, "hex");

    if (
      hashBuffer.length === storedBuffer.length &&
      crypto.timingSafeEqual(hashBuffer, storedBuffer)
    ) {
      return true;
    }

    // If iterations was default but stored hash was made with legacy 10,000 iterations:
    if (iterations === DEFAULT_ITERATIONS) {
      const legacyHash = crypto
        .pbkdf2Sync(password, salt, LEGACY_ITERATIONS, KEYLEN, DIGEST)
        .toString("hex");
      const legacyBuffer = Buffer.from(legacyHash, "hex");
      if (
        legacyBuffer.length === storedBuffer.length &&
        crypto.timingSafeEqual(legacyBuffer, storedBuffer)
      ) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Password verification error:", error);
    return false;
  }
}

/**
 * Cryptographically signs a session payload using HMAC-SHA256.
 */
export function signSessionToken(user: {
  id: string;
  role: string;
  email: string;
}): string {
  const now = Date.now();
  const payload: SessionPayload = {
    id: user.id,
    role: user.role,
    email: user.email,
    iat: now,
    exp: now + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies a signed session token. Returns the payload if valid and not expired, or null.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 2) {
      // Check legacy JSON string format as fallback during transition
      try {
        const legacy = JSON.parse(decodeURIComponent(token));
        if (legacy && legacy.id && legacy.role) {
          return {
            id: legacy.id,
            role: legacy.role,
            email: legacy.email || "",
            iat: Date.now(),
            exp: Date.now() + 3600000,
          };
        }
      } catch {
        return null;
      }
      return null;
    }

    const [payloadB64, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(payloadB64)
      .digest("base64url");

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    );

    if (!payload.id || !payload.role || !payload.exp) {
      return null;
    }

    if (Date.now() > payload.exp) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

// Rate Limiting Store
interface RateLimitEntry {
  count: number;
  resetAt: number;
  lockoutUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup stale rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitStore.entries()) {
    if (val.resetAt < now && (!val.lockoutUntil || val.lockoutUntil < now)) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

/**
 * General purpose rate limiter.
 */
export function checkRateLimit(
  key: string,
  maxAllowed: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || record.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: maxAllowed - 1, retryAfterSeconds: 0 };
  }

  if (record.lockoutUntil && record.lockoutUntil > now) {
    const retryAfterSeconds = Math.ceil((record.lockoutUntil - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  if (record.count >= maxAllowed) {
    record.lockoutUntil = now + windowMs;
    rateLimitStore.set(key, record);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  record.count += 1;
  rateLimitStore.set(key, record);
  return {
    allowed: true,
    remaining: maxAllowed - record.count,
    retryAfterSeconds: 0,
  };
}

/**
 * Specialized login attempt rate limiter.
 */
export function checkLoginRateLimit(key: string): { allowed: boolean; waitMinutes?: number } {
  const check = checkRateLimit(key, 5, 15 * 60 * 1000);
  if (!check.allowed) {
    return { allowed: false, waitMinutes: Math.ceil(check.retryAfterSeconds / 60) };
  }
  return { allowed: true };
}

export function recordFailedLogin(key: string): { lockedOut: boolean; waitMinutes?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key) || { count: 0, resetAt: now + 15 * 60 * 1000 };
  record.count += 1;

  if (record.count >= 5) {
    record.lockoutUntil = now + 15 * 60 * 1000;
    rateLimitStore.set(key, record);
    return { lockedOut: true, waitMinutes: 15 };
  }

  rateLimitStore.set(key, record);
  return { lockedOut: false };
}

export function resetLoginAttempts(key: string): void {
  rateLimitStore.delete(key);
}

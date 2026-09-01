import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/db";
import { checkRateLimit } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    // Rate limit coupon validation: max 15 attempts per 5 minutes per IP
    const rateCheck = checkRateLimit(`coupon_val:${clientIp}`, 15, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          valid: false,
          discount: 0,
          message: `Too many voucher verification attempts. Please wait ${rateCheck.retryAfterSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { code, subtotal } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, discount: 0, message: "Coupon code is required" },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase().slice(0, 30);
    const numSubtotal = Number(subtotal);

    const result = await validateCoupon(
      cleanCode,
      isNaN(numSubtotal) || numSubtotal < 0 ? 0 : numSubtotal
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Coupon validate error:", error);
    return NextResponse.json(
      { valid: false, discount: 0, message: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}

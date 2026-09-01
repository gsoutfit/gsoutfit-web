import { NextRequest, NextResponse } from "next/server";
import { getCoupons, createCoupon } from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireAdmin(request);
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    const coupons = await getCoupons();
    return NextResponse.json({ success: true, data: coupons });
  } catch (error) {
    console.error("Coupons GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireAdmin(request);
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    const body = await request.json();
    if (!body.code) {
      return NextResponse.json(
        { success: false, message: "Coupon code is required" },
        { status: 400 }
      );
    }

    const newCoupon = await createCoupon({
      code: body.code.toUpperCase().trim(),
      discountPercent: body.discountPercent ? Number(body.discountPercent) : undefined,
      discountAmount: body.discountAmount ? Number(body.discountAmount) : undefined,
      minSpend: Number(body.minSpend || 0),
      maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : undefined,
      expiresAt: body.expiresAt || new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString(),
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    });

    return NextResponse.json({ success: true, data: newCoupon }, { status: 201 });
  } catch (error) {
    console.error("Coupons POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create coupon" },
      { status: 500 }
    );
  }
}

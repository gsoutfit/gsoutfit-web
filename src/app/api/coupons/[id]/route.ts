import { NextRequest, NextResponse } from "next/server";
import { deleteCoupon } from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const authCheck = await requireAdmin(request);
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    const { id } = await params;
    const success = await deleteCoupon(id);
    if (!success) {
      return NextResponse.json(
        { success: false, message: "Coupon not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Coupon DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}

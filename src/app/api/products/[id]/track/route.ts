import { NextResponse } from "next/server";
import { trackProductActivity } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const action = body.action as "view" | "cart_add" | "wishlist";

    if (!["view", "cart_add", "wishlist"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Invalid tracking action" },
        { status: 400 }
      );
    }

    const tracked = await trackProductActivity(id, action);
    return NextResponse.json({ success: tracked });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to track activity" },
      { status: 500 }
    );
  }
}

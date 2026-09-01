import { NextResponse } from "next/server";
import { trackProductActivity } from "@/lib/db";
import { checkRateLimit } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // No session (anonymous view tracking is legitimate), but rate-limit so
    // counters can't be inflated by a script.
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const rateCheck = checkRateLimit(`track:${clientIp}`, 120, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit reached" },
        { status: 429 }
      );
    }

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

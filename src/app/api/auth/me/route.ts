import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, user: null });
    }
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ success: false, user: null });
  }
}

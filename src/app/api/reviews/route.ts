import { NextRequest, NextResponse } from "next/server";
import { getReviews, addReview, getProductById } from "@/lib/db";
import { checkRateLimit } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId") || undefined;
    const reviews = await getReviews(productId);
    return NextResponse.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateCheck = checkRateLimit(`review:${clientIp}`, 5, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Review submission rate limit reached. Please wait ${Math.ceil(
            rateCheck.retryAfterSeconds / 60
          )} minutes.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { productId, userName, rating, title, comment } = body;

    if (!productId || !userName || !rating || !comment) {
      return NextResponse.json(
        { success: false, message: "Product ID, name, rating, and comment are required." },
        { status: 400 }
      );
    }

    // Verify product actually exists
    const product = await getProductById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be a numerical value between 1 and 5." },
        { status: 400 }
      );
    }

    // Sanitize user inputs against XSS and excessive length
    const cleanUserName = String(userName).replace(/<[^>]*>?/gm, "").trim().slice(0, 60);
    const cleanTitle = String(title || "Verified Purchase Review").replace(/<[^>]*>?/gm, "").trim().slice(0, 100);
    const cleanComment = String(comment).replace(/<[^>]*>?/gm, "").trim().slice(0, 1000);

    if (cleanUserName.length < 2 || cleanComment.length < 5) {
      return NextResponse.json(
        { success: false, message: "Please provide a meaningful reviewer name and comment." },
        { status: 400 }
      );
    }

    const newReview = await addReview({
      productId,
      userName: cleanUserName,
      userAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        cleanUserName
      )}&backgroundColor=18181c&textColor=d4af37`,
      rating: Math.round(numRating),
      title: cleanTitle,
      comment: cleanComment,
      verified: true,
      helpfulCount: 0,
    });

    return NextResponse.json({ success: true, data: newReview }, { status: 201 });
  } catch (error) {
    console.error("Reviews POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit review." },
      { status: 500 }
    );
  }
}

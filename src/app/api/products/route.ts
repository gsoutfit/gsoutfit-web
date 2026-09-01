import { NextRequest, NextResponse } from "next/server";
import { getProducts, createProduct } from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const season = searchParams.get("season") || undefined;
    const featured = searchParams.get("featured") === "true" ? true : undefined;
    const trending = searchParams.get("trending") === "true" ? true : undefined;
    const flashSale = searchParams.get("flashSale") === "true" ? true : undefined;
    const search = searchParams.get("search") || undefined;
    const sort = searchParams.get("sort") || undefined;
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const size = searchParams.get("size") || undefined;
    const color = searchParams.get("color") || undefined;

    const products = await getProducts({
      category,
      season,
      featured,
      trending,
      flashSale,
      search,
      sort,
      minPrice,
      maxPrice,
      size,
      color,
    });

    return NextResponse.json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
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
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json(
        { success: false, message: "Product name, price, and category are required" },
        { status: 400 }
      );
    }

    const newProduct = await createProduct({
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "-"),
      tagline: body.tagline || "",
      description: body.description || "",
      fabricCare: body.fabricCare || "",
      fitDetails: body.fitDetails || "",
      price: Number(body.price),
      discountPrice: body.discountPrice ? Number(body.discountPrice) : undefined,
      category: body.category,
      season: body.season || "All-Season",
      sizes: body.sizes || ["S", "M", "L", "XL"],
      colors: body.colors || [{ name: "Standard", hex: "#000000" }],
      stock: Number(body.stock || 10),
      images: body.images?.length
        ? body.images
        : ["https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80"],
      rating: 5.0,
      reviewCount: 1,
      tags: body.tags || [body.category],
      isFeatured: Boolean(body.isFeatured),
      isTrending: Boolean(body.isTrending),
      isNewArrival: Boolean(body.isNewArrival ?? true),
      isBestSeller: Boolean(body.isBestSeller),
      isFlashSale: Boolean(body.isFlashSale),
      flashSaleDiscount: body.flashSaleDiscount ? Number(body.flashSaleDiscount) : undefined,
    });

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error) {
    console.error("Products POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create product" },
      { status: 500 }
    );
  }
}

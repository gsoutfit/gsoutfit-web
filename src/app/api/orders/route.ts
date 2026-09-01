import { NextRequest, NextResponse } from "next/server";
import { getOrders, createOrder, getProducts, validateCoupon } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";
import { getSessionUser } from "@/lib/server-auth";
import { checkRateLimit } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser(request);
    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get("userId") || undefined;

    if (!sessionUser) {
      return NextResponse.json(
        { success: false, message: "Authentication required to view orders." },
        { status: 401 }
      );
    }

    let orders;
    if (sessionUser.role === "admin") {
      // Admins can view all orders or query by user
      orders = await getOrders(requestedUserId);
    } else {
      // Regular customers can ONLY view their own orders
      const allOrders = await getOrders();
      const matched = allOrders.filter(
        (o) =>
          o.userId === sessionUser.id ||
          o.customer.email.toLowerCase() === sessionUser.email.toLowerCase()
      );
      orders = matched;
    }

    return NextResponse.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
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

    // Rate limit checkout creation: max 10 orders per 10 minutes per IP
    const rateCheck = checkRateLimit(`order_post:${clientIp}`, 10, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many order requests. Please wait ${rateCheck.retryAfterSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    if (!body.items || !Array.isArray(body.items) || !body.items.length) {
      return NextResponse.json(
        { success: false, message: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    const sessionUser = await getSessionUser(request);
    const dbProducts = await getProducts();

    // 1. Server-side Price & Stock Validation
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of body.items) {
      const dbProd = dbProducts.find((p) => p.id === item.productId);
      if (!dbProd) {
        return NextResponse.json(
          { success: false, message: `Product ${item.productId} is unavailable or retired.` },
          { status: 400 }
        );
      }

      const qty = Math.max(1, Math.min(20, Math.floor(Number(item.quantity || 1))));
      if (dbProd.stock < qty) {
        return NextResponse.json(
          { success: false, message: `Insufficient inventory for ${dbProd.name}. Available: ${dbProd.stock}.` },
          { status: 400 }
        );
      }

      const itemPrice = dbProd.discountPrice ?? dbProd.price;
      calculatedSubtotal += itemPrice * qty;

      validatedItems.push({
        productId: dbProd.id,
        name: dbProd.name,
        image: dbProd.images[0] || "",
        size: String(item.size || "Standard").slice(0, 20),
        color: String(item.color || "Standard").slice(0, 30),
        quantity: qty,
        price: itemPrice,
      });
    }

    // 2. Server-side Coupon Validation
    let discountAmount = 0;
    let validatedCouponCode: string | undefined = undefined;

    if (body.couponCode && typeof body.couponCode === "string") {
      const couponCheck = await validateCoupon(body.couponCode, calculatedSubtotal);
      if (couponCheck.valid) {
        discountAmount = couponCheck.discount;
        validatedCouponCode = body.couponCode.toUpperCase().slice(0, 30);
      }
    }

    // 3. Shipping & Tax Calculation in BDT
    const shippingFee = calculatedSubtotal >= 1500 ? 0 : 120;
    const tax = Math.round((calculatedSubtotal - discountAmount) * 0.05 * 100) / 100;
    const finalTotal = Math.max(0, calculatedSubtotal - discountAmount + shippingFee + tax);

    // 4. Payment Method & Details Validation
    const rawMethod = String(body.paymentMethod || "cod").toLowerCase();
    const paymentMethod = ["cod", "bkash", "nagad"].includes(rawMethod) ? rawMethod : "cod";

    let paymentDetails: any = undefined;
    if (paymentMethod === "bkash" || paymentMethod === "nagad") {
      const senderNum = String(body.paymentDetails?.senderNumber || "").replace(/[^0-9+]/g, "").slice(0, 20);
      const trxId = String(body.paymentDetails?.transactionId || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 30);

      if (!senderNum || !trxId) {
        return NextResponse.json(
          { success: false, message: `Please provide a valid ${paymentMethod === "bkash" ? "bKash" : "Nagad"} mobile number and Transaction ID (TrxID).` },
          { status: 400 }
        );
      }

      paymentDetails = {
        senderNumber: senderNum,
        transactionId: trxId,
        paymentNumber: paymentMethod === "bkash" ? "01700-123456" : "01800-123456",
      };
    }

    const cleanCustomerName = String(body.customer?.name || sessionUser?.name || "Customer")
      .replace(/<[^>]*>?/gm, "")
      .trim()
      .slice(0, 80);

    const cleanEmail = String(body.customer?.email || sessionUser?.email || "customer@gentlemansavage.com")
      .toLowerCase()
      .trim()
      .slice(0, 100);

    const cleanPhone = String(body.customer?.phone || sessionUser?.phone || "")
      .replace(/[^0-9+\s()-]/g, "")
      .trim()
      .slice(0, 25);

    const orderNumber = generateOrderNumber();
    const newOrder = await createOrder({
      orderNumber,
      userId: sessionUser?.id || "guest",
      customer: {
        name: cleanCustomerName,
        email: cleanEmail,
        phone: cleanPhone,
      },
      shippingAddress: {
        street: String(body.shippingAddress?.street || "").replace(/<[^>]*>?/gm, "").slice(0, 150),
        city: String(body.shippingAddress?.city || "").replace(/<[^>]*>?/gm, "").slice(0, 60),
        state: String(body.shippingAddress?.state || "").replace(/<[^>]*>?/gm, "").slice(0, 60),
        zip: String(body.shippingAddress?.zip || "").replace(/<[^>]*>?/gm, "").slice(0, 20),
        country: String(body.shippingAddress?.country || "Bangladesh").replace(/<[^>]*>?/gm, "").slice(0, 50),
      },
      billingAddress: body.billingAddress,
      items: validatedItems,
      subtotal: calculatedSubtotal,
      discountAmount,
      couponCode: validatedCouponCode,
      shippingFee,
      shippingMethod: shippingFee === 0 ? "Complimentary VIP Courier" : "Standard Doorstep Delivery",
      tax,
      total: finalTotal,
      paymentMethod: paymentMethod as any,
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
      paymentDetails,
      status: "Pending",
      trackingNumber: `GS-EXP-${Math.floor(10000000 + Math.random() * 90000000)}`,
      timeline: [
        {
          status: "Pending",
          description:
            paymentMethod === "cod"
              ? "Order placed with Cash on Delivery."
              : `Order placed via ${paymentMethod === "bkash" ? "bKash" : "Nagad"} (TrxID: ${paymentDetails?.transactionId}).`,
          timestamp: new Date().toISOString(),
        },
      ],
    });

    return NextResponse.json(
      {
        success: true,
        data: newOrder,
        message: `Order #${orderNumber} registered successfully!`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to place order." },
      { status: 500 }
    );
  }
}

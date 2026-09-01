import { NextRequest, NextResponse } from "next/server";
import { getUsers, updateUser, getOrders } from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireAdmin(request);
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    const users = await getUsers();
    const orders = await getOrders();

    const customersWithStats = users.map((user) => {
      const userOrders = orders.filter((o) => o.userId === user.id);
      const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);
      const { passwordHash: _, passwordSalt: __, verificationCode: ___, ...safeUser } = user;

      return {
        ...safeUser,
        orderCount: userOrders.length,
        totalSpent,
        lastOrderDate: userOrders[0]?.createdAt || null,
      };
    });

    return NextResponse.json({ success: true, data: customersWithStats });
  } catch (error) {
    console.error("Customers API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authCheck = await requireAdmin(request);
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    const body = await request.json();
    const { id, role, phone, name } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const updated = await updateUser(id, { role, phone, name });
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const { passwordHash: _, passwordSalt: __, verificationCode: ___, ...safeUser } = updated;
    return NextResponse.json({ success: true, data: safeUser });
  } catch (error) {
    console.error("Customer update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update customer" },
      { status: 500 }
    );
  }
}

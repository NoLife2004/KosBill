import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { bills } from "@/server/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

// GET /api/bills/[id] - Fetch a single bill
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const bill = await db.query.bills.findFirst({
      where: and(eq(bills.id, id), eq(bills.userId, session.user.id)),
    });

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    return NextResponse.json(bill);
  } catch (error) {
    console.error("GET /api/bills/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch bill" }, { status: 500 });
  }
}

// PUT /api/bills/[id] - Update a bill
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { billName, amount, dueDate, status } = body;

    const [updatedBill] = await db
      .update(bills)
      .set({
        billName,
        amount: Number(amount),
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status,
        updatedAt: new Date(),
      })
      .where(and(eq(bills.id, id), eq(bills.userId, session.user.id)))
      .returning();

    if (!updatedBill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    return NextResponse.json(updatedBill);
  } catch (error) {
    console.error("PUT /api/bills/[id] error:", error);
    return NextResponse.json({ error: "Failed to update bill" }, { status: 500 });
  }
}

// DELETE /api/bills/[id] - Delete a bill
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const result = await db
      .delete(bills)
      .where(and(eq(bills.id, id), eq(bills.userId, session.user.id)))
      .returning();

    if (!result.length) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/bills/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete bill" }, { status: 500 });
  }
}

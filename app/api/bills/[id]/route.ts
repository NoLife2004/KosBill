import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { bills } from "@/server/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

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
  } catch (error: any) {
    console.error("GET /api/bills/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
    
    // Create update object with only provided fields
    const updateData: any = {};

    // Only set fields that are explicitly provided in the request
    if (body.billName !== undefined && body.billName !== null) {
      updateData.billName = body.billName;
    }
    if (body.amount !== undefined && body.amount !== null) {
      updateData.amount = Number(body.amount);
    }
    if (body.dueDate !== undefined && body.dueDate !== null) {
      updateData.dueDate = new Date(body.dueDate);
    }
    if (body.status !== undefined && body.status !== null) {
      updateData.status = body.status;
    }
    
    updateData.updatedAt = new Date();

    // Check if we have anything to update (besides updatedAt)
    const fieldsToUpdate = Object.keys(updateData).filter(key => key !== 'updatedAt');
    if (fieldsToUpdate.length === 0) {
      // If nothing to update, just return the existing bill
      const currentBill = await db.query.bills.findFirst({
        where: and(eq(bills.id, id), eq(bills.userId, session.user.id)),
      });
      return NextResponse.json(currentBill);
    }

    const result = await db
      .update(bills)
      .set(updateData)
      .where(and(eq(bills.id, id), eq(bills.userId, session.user.id)))
      .returning();

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error("PUT /api/bills/[id] error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      message: error.message || "Unknown error"
    }, { status: 500 });
  }
}

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

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/bills/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

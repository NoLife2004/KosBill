import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { debts } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const debt = await db.query.debts.findFirst({
      where: and(eq(debts.id, id), eq(debts.userId, session.user.id)),
      with: {
        contact: true,
        payments: true,
      },
    });

    if (!debt) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json(debt);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch record" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contactId, type, amount, dueDate, note } = await request.json();

    const [updatedDebt] = await db
      .update(debts)
      .set({
        contactId,
        type,
        amount,
        dueDate: dueDate ? new Date(dueDate) : null,
        note,
        updatedAt: new Date(),
      })
      .where(and(eq(debts.id, id), eq(debts.userId, session.user.id)))
      .returning();

    if (!updatedDebt) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json(updatedDebt);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update record" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db
      .delete(debts)
      .where(and(eq(debts.id, id), eq(debts.userId, session.user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete record" }, { status: 500 });
  }
}

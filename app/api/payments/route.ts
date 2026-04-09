import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { payments, debts } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { debtId, amount, note, proofImage, date } = await request.json();

    if (!debtId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Fetch current debt
    const debt = await db.query.debts.findFirst({
      where: and(eq(debts.id, debtId), eq(debts.userId, session.user.id)),
    });

    if (!debt) {
      return NextResponse.json({ error: "Debt not found" }, { status: 404 });
    }

    // 2. Insert payment
    const [newPayment] = await db
      .insert(payments)
      .values({
        id: nanoid(),
        debtId,
        amount,
        note,
        proofImage,
        date: date ? new Date(date) : new Date(),
      })
      .returning();

    // 3. Update debt remaining amount and status
    const newRemainingAmount = Math.max(0, debt.remainingAmount - amount);
    const newStatus = newRemainingAmount === 0 ? "paid" : "partial";

    await db
      .update(debts)
      .set({
        remainingAmount: newRemainingAmount,
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(debts.id, debtId));

    return NextResponse.json({ payment: newPayment, newStatus, newRemainingAmount });
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}

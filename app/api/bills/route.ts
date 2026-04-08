import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/server/db";
import { bills } from "@/server/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, desc } from "drizzle-orm";

// GET /api/bills - Fetch all bills for the user
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allBills = await db
      .select()
      .from(bills)
      .where(eq(bills.userId, session.user.id))
      .orderBy(desc(bills.dueDate));

    return NextResponse.json(allBills);
  } catch (error) {
    console.error("GET /api/bills error:", error);
    return NextResponse.json({ error: "Failed to fetch bills" }, { status: 500 });
  }
}

// POST /api/bills - Create a new bill
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { billName, amount, dueDate } = body;

    if (!billName || !amount || !dueDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [newBill] = await db
      .insert(bills)
      .values({
        id: nanoid(),
        userId: session.user.id,
        billName,
        amount: Number(amount),
        dueDate: new Date(dueDate),
        status: "unpaid",
      })
      .returning();

    return NextResponse.json(newBill, { status: 201 });
  } catch (error) {
    console.error("POST /api/bills error:", error);
    return NextResponse.json({ error: "Failed to create bill" }, { status: 500 });
  }
}

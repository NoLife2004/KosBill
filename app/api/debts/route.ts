import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { debts, contacts } from "@/server/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { nanoid } from "nanoid";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "debt" or "credit"
    const status = searchParams.get("status");

    let whereClause = eq(debts.userId, session.user.id);

    if (type) {
      whereClause = and(whereClause, eq(debts.type, type)) as any;
    }
    if (status) {
      whereClause = and(whereClause, eq(debts.status, status)) as any;
    }

    const userDebts = await db.query.debts.findMany({
      where: whereClause,
      with: {
        contact: true,
      },
      orderBy: [desc(debts.createdAt)],
    });

    return NextResponse.json(userDebts);
  } catch (error) {
    console.error("Fetch debts error:", error);
    return NextResponse.json({ error: "Failed to fetch debts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contactId, type, amount, dueDate, note } = await request.json();

    if (!contactId || !type || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [newDebt] = await db
      .insert(debts)
      .values({
        id: nanoid(),
        userId: session.user.id,
        contactId,
        type,
        amount,
        remainingAmount: amount,
        dueDate: dueDate ? new Date(dueDate) : null,
        note,
        status: "unpaid",
      })
      .returning();

    return NextResponse.json(newDebt);
  } catch (error) {
    console.error("Create debt error:", error);
    return NextResponse.json({ error: "Failed to create debt" }, { status: 500 });
  }
}

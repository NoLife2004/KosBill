import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { debts, contacts } from "@/server/db/schema";
import { eq, sum, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Total I Owe (Debts)
    const totalIOweResult = await db
      .select({ total: sum(debts.remainingAmount) })
      .from(debts)
      .where(and(eq(debts.userId, userId), eq(debts.type, "debt")));

    // Total Owed to Me (Credits)
    const totalOwedMeResult = await db
      .select({ total: sum(debts.remainingAmount) })
      .from(debts)
      .where(and(eq(debts.userId, userId), eq(debts.type, "credit")));

    const totalIOwe = Number(totalIOweResult[0]?.total || 0);
    const totalOwedMe = Number(totalOwedMeResult[0]?.total || 0);
    const netBalance = totalOwedMe - totalIOwe;

    // Recent Debts with Contact Info
    const recentDebts = await db.query.debts.findMany({
      where: eq(debts.userId, userId),
      with: {
        contact: true
      },
      orderBy: (debts, { desc }) => [desc(debts.createdAt)],
      limit: 5,
    });

    return NextResponse.json({
      summary: {
        totalIOwe,
        totalOwedMe,
        netBalance,
      },
      recentDebts,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { payments } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const debtId = searchParams.get("debtId");

    if (!debtId) {
      return NextResponse.json({ error: "Debt ID is required" }, { status: 400 });
    }

    const debtPayments = await db.query.payments.findMany({
      where: eq(payments.debtId, debtId),
      orderBy: [desc(payments.date)],
    });

    return NextResponse.json(debtPayments);
  } catch (error) {
    console.error("Fetch payments error:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

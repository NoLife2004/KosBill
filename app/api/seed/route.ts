import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/server/db";
import { bills } from "@/server/db/schema";
import { auth } from "@/lib/auth";
import { addDays, subDays } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();

    const dummyBills = [
      {
        id: nanoid(),
        userId: session.user.id,
        billName: "Rent Payment",
        amount: 1500000,
        dueDate: subDays(today, 2), // Overdue
        status: "unpaid",
      },
      {
        id: nanoid(),
        userId: session.user.id,
        billName: "Electricity",
        amount: 350000,
        dueDate: addDays(today, 1), // Due tomorrow
        status: "unpaid",
      },
      {
        id: nanoid(),
        userId: session.user.id,
        billName: "Wifi",
        amount: 200000,
        dueDate: addDays(today, 3), // Due in 3 days
        status: "unpaid",
      },
      {
        id: nanoid(),
        userId: session.user.id,
        billName: "Water Bill",
        amount: 50000,
        dueDate: addDays(today, 7),
        status: "unpaid",
      },
      {
        id: nanoid(),
        userId: session.user.id,
        billName: "Laundry",
        amount: 120000,
        dueDate: subDays(today, 5),
        status: "paid",
      },
    ];

    await db.insert(bills).values(dummyBills as any);

    return NextResponse.json({ success: true, count: dummyBills.length });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 });
  }
}

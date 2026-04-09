import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { debts, user, contacts } from "@/server/db/schema";
import { eq, and, ne, lte, gte, isNotNull, sql } from "drizzle-orm";
import { sendEmail } from "@/lib/email";
import { differenceInDays, isSameDay, format } from "date-fns";

export async function GET(request: NextRequest) {
  // Simple protection with a CRON_SECRET if needed
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    
    // Find debts that are not paid and have a due date
    const pendingDebts = await db.query.debts.findMany({
      where: and(ne(debts.status, "paid"), isNotNull(debts.dueDate)),
      with: {
        user: true,
        contact: true,
      },
    });

    const results = [];

    for (const debt of pendingDebts) {
      if (!debt.dueDate || !debt.user?.email) continue;

      const diffDays = differenceInDays(new Date(debt.dueDate), now);
      let sendType = "";

      if (diffDays === 3) sendType = "H-3 Reminder";
      else if (diffDays === 1) sendType = "H-1 Reminder";
      else if (isSameDay(new Date(debt.dueDate), now)) sendType = "Due Date Reminder";
      else if (diffDays === -1) sendType = "Overdue Reminder";

      if (sendType) {
        const isDebt = debt.type === "debt";
        const contactName = debt.contact?.name || "Someone";
        const amountStr = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(debt.remainingAmount);
        
        const subject = `[KosBill] ${sendType}: ${debt.type === "debt" ? "Payment Due" : "Payment Owed"}`;
        const html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2563eb;">${sendType}</h2>
            <p>Hello <strong>${debt.user.name}</strong>,</p>
            <p>This is a reminder for the following record:</p>
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Contact:</strong> ${contactName}</p>
              <p style="margin: 5px 0;"><strong>Amount:</strong> ${amountStr}</p>
              <p style="margin: 5px 0;"><strong>Due Date:</strong> ${format(new Date(debt.dueDate), "dd MMM yyyy")}</p>
              <p style="margin: 5px 0;"><strong>Type:</strong> ${isDebt ? "You owe money" : "Money owed to you"}</p>
            </div>
            <p>Please log in to your dashboard to manage this record.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Go to Dashboard</a>
          </div>
        `;

        try {
          await sendEmail({
            to: debt.user.email,
            subject,
            html,
          });
          results.push({ id: debt.id, type: sendType, sent: true });
        } catch (e) {
          results.push({ id: debt.id, type: sendType, sent: false, error: "Email failed" });
        }
      }
    }

    return NextResponse.json({ processed: results.length, results });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Failed to run cron" }, { status: 500 });
  }
}

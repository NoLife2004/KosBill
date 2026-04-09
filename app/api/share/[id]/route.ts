import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { debts } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const debt = await db.query.debts.findFirst({
      where: eq(debts.id, id),
      with: {
        contact: {
          columns: {
            name: true,
          }
        },
        user: {
          columns: {
            name: true,
          }
        }
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

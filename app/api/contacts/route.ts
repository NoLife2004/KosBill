import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { contacts } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
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

    const userContacts = await db.query.contacts.findMany({
      where: eq(contacts.userId, session.user.id),
      orderBy: (contacts, { asc }) => [asc(contacts.name)],
    });

    return NextResponse.json(userContacts);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
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

    const { name, phone, email } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const [newContact] = await db
      .insert(contacts)
      .values({
        id: nanoid(),
        userId: session.user.id,
        name,
        phone,
        email,
      })
      .returning();

    return NextResponse.json(newContact);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}

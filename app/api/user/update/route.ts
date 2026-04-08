import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { user } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Tidak diizinkan" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, image } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Nama harus diisi" },
        { status: 400 }
      );
    }

    // Update user profile in database
    await db.update(user)
      .set({ 
        name, 
        image,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id));

    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        name,
        image,
      }
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui profil" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    const userId = parseInt(id);

    if (session.userId !== userId && !session.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.update(users).set({ onboarded: true }).where(eq(users.id, userId));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/users/[id]/onboarded:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    const userId = parseInt(id);

    // Only allow updating own profile (or admin)
    if (session.userId !== userId && !session.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const [updated] = await db
      .update(users)
      .set({
        ...(body.name !== undefined && { name: body.name }),
        ...(body.avatar !== undefined && { avatar: body.avatar }),
      })
      .where(eq(users.id, userId))
      .returning();

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/users/[id]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

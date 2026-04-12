import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    return NextResponse.json(allUsers);
  } catch (err) {
    console.error("GET /api/admin/users:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

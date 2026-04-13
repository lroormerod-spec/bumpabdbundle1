import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailLog } from "@/lib/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const logs = await db
    .select()
    .from(emailLog)
    .orderBy(desc(emailLog.sentAt))
    .limit(100);

  return NextResponse.json(logs);
}

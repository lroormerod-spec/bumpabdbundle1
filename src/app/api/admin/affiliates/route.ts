import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { affiliateConfig } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const configs = await db.select().from(affiliateConfig).orderBy(affiliateConfig.retailerName);
  return NextResponse.json(configs);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, publisherId, programmeId, network, active, notes, customUrlTemplate, trackingParam } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const [updated] = await db.update(affiliateConfig)
    .set({ publisherId, programmeId, network, active, notes, customUrlTemplate, trackingParam, updatedAt: new Date() })
    .where(eq(affiliateConfig.id, id))
    .returning();

  return NextResponse.json(updated);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { retailerName, retailerDomain, network, publisherId, programmeId, active, notes } = body;
  if (!retailerName || !retailerDomain || !network) {
    return NextResponse.json({ error: "retailerName, retailerDomain and network required" }, { status: 400 });
  }
  const [created] = await db.insert(affiliateConfig)
    .values({ retailerName, retailerDomain, network, publisherId, programmeId, active: active || false, notes })
    .returning();
  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await db.delete(affiliateConfig).where(eq(affiliateConfig.id, parseInt(id)));
  return NextResponse.json({ ok: true });
}

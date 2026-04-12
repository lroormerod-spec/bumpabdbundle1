import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.isAdmin) return null;
  return session;
}

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const posts = await db.select().from(blogPosts).orderBy(blogPosts.createdAt);
    return NextResponse.json(posts);
  } catch (err) {
    console.error("GET /api/admin/blog:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { title, slug, content, excerpt, coverImage, author, status } = body;

    if (!title || !slug) return NextResponse.json({ error: "Title and slug required" }, { status: 400 });

    const [post] = await db
      .insert(blogPosts)
      .values({ title, slug, content: content || "", excerpt, coverImage, author: author || "Bump & Bundle", status: status || "draft" })
      .returning();

    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/blog:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { id, title, slug, content, excerpt, coverImage, author, status } = body;

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const [updated] = await db
      .update(blogPosts)
      .set({
        ...(title && { title }),
        ...(slug && { slug }),
        ...(content !== undefined && { content }),
        ...(excerpt !== undefined && { excerpt }),
        ...(coverImage !== undefined && { coverImage }),
        ...(author && { author }),
        ...(status && { status }),
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/admin/blog:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await db.delete(blogPosts).where(eq(blogPosts.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/admin/blog:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

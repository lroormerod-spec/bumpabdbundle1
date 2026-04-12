import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import NavBar from "@/components/NavBar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Basic Auth is handled by middleware — no session check needed here
  const session = await getSession();
  const user = session ? await db.select().from(users).where(eq(users.id, session.userId)).limit(1).then(r => r[0]) : null;

  return (
    <div className="min-h-screen bg-background">
      <NavBar user={user ? { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin } : null} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

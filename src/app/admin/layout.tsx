import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import NavBar from "@/components/NavBar";
import AdminLogout from "@/components/AdminLogout";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Basic Auth is handled by middleware — no session check needed here
  const session = await getSession();
  const user = session ? await db.select().from(users).where(eq(users.id, session.userId)).limit(1).then(r => r[0]) : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="font-bold text-lg">Bump <span className="text-primary">&</span> Bundle <span className="text-xs font-normal text-muted-foreground ml-1">Admin</span></a>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back to site</a>
            <AdminLogout />
          </div>
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

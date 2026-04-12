import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import NavBar from "@/components/NavBar";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.isAdmin) redirect("/");

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user) redirect("/");

  return (
    <div className="min-h-screen bg-background">
      <NavBar user={{ id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin }} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

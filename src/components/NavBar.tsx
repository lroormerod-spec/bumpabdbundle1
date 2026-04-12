"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, LayoutDashboard, Baby } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface NavBarProps {
  user?: User | null;
}

export default function NavBar({ user }: NavBarProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Signed out");
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={user ? "/app" : "/"} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <svg viewBox="0 0 36 36" fill="none" className="w-5 h-5" aria-label="Bump & Bundle logo">
                <ellipse cx="18" cy="20" rx="10" ry="12" fill="white" opacity="0.9"/>
                <ellipse cx="18" cy="10" rx="6" ry="7" fill="white" opacity="0.9"/>
                <circle cx="11" cy="14" r="1.5" fill="white" opacity="0.6"/>
              </svg>
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">
              Bump <span className="text-primary">&</span> Bundle
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Blog
            </Link>
            {user && (
              <>
                <Link href="/app" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <Link href="/app/registry" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Registry
                </Link>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                        {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-sm font-medium">
                      {user.name || user.email.split("@")[0]}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/app">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/app/registry">
                      <Baby className="mr-2 h-4 w-4" />
                      Registry
                    </Link>
                  </DropdownMenuItem>
                  {user.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <Link href="/#sign-in">Get started</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

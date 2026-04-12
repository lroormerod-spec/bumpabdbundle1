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
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6" aria-label="Bump & Bundle logo">
                {/* Baby head */}
                <circle cx="16" cy="11" r="5.5" fill="white" opacity="0.95"/>
                {/* Sleepy eyes */}
                <path d="M13.5 10.5 Q14 9.5 14.5 10.5" stroke="hsl(152,28%,38%)" strokeWidth="0.9" strokeLinecap="round"/>
                <path d="M17.5 10.5 Q18 9.5 18.5 10.5" stroke="hsl(152,28%,38%)" strokeWidth="0.9" strokeLinecap="round"/>
                {/* Smile */}
                <path d="M14.5 12.5 Q16 14 17.5 12.5" stroke="hsl(152,28%,38%)" strokeWidth="0.9" strokeLinecap="round"/>
                {/* Swaddle body */}
                <ellipse cx="16" cy="21" rx="9" ry="7.5" fill="white" opacity="0.95"/>
                {/* Swaddle wrap */}
                <path d="M8 20 Q16 17.5 24 20" stroke="hsl(152,28%,55%)" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
                {/* Little heart */}
                <path d="M14.8 22.5 C14.8 21.7 13.8 21 13.8 22 C13.8 23 14.8 23.7 16 24.5 C17.2 23.7 18.2 23 18.2 22 C18.2 21 17.2 21.7 17.2 22.5 C17.2 21.7 16.6 21.5 16 22 C15.4 21.5 14.8 21.7 14.8 22.5Z" fill="hsl(352,60%,72%)"/>
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
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="text-muted-foreground" asChild>
                  <Link href="/#sign-in">Sign in</Link>
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
                  <Link href="/#sign-in">Get started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

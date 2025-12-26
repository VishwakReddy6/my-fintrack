"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search, Bell, MoreVertical, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileSidebar } from "./MobileSidebar";

function getPageTitle(pathname: string): string {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/transactions") return "Transactions";
  if (pathname === "/budgets") return "Budgets";
  if (pathname === "/recurring") return "Recurring";
  if (pathname === "/reports") return "Reports";
  return "Dashboard";
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuthActions();
  const pageTitle = getPageTitle(pathname || "");

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center">
      <div className="flex items-center justify-between w-full px-4 md:px-6">
        {/* Left side - Mobile menu + Breadcrumb */}
        <div className="flex items-center gap-4">
          <MobileSidebar />
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 hidden sm:inline">My Fintrack</span>
            <span className="text-slate-400 hidden sm:inline">/</span>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-emerald-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">F</span>
              </div>
              <span className="text-sm font-medium text-slate-900">{pageTitle}</span>
            </div>
          </div>
        </div>

        {/* Right side - Search, Notifications, User menu */}
        <div className="flex items-center gap-3">
          {/* Search - placeholder for now */}
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Search className="w-5 h-5 text-slate-600" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Notifications - placeholder for now */}
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">U</span>
                </div>
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}


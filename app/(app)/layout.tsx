"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { signOut } = useAuthActions();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <>
      <Authenticated>
        <div className="min-h-screen bg-slate-50">
          {/* Top Navigation */}
          <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-8">
                  <Link href="/dashboard" className="text-xl font-bold text-slate-900">
                    My Fintrack
                  </Link>
                  <nav className="hidden md:flex gap-6">
                    <Link
                      href="/dashboard"
                      className="text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/transactions"
                      className="text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Transactions
                    </Link>
                    <Link
                      href="/budgets"
                      className="text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Budgets
                    </Link>
                    <Link
                      href="/recurring"
                      className="text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Recurring
                    </Link>
                    <Link
                      href="/reports"
                      className="text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Reports
                    </Link>
                  </nav>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-8">{children}</main>
        </div>
      </Authenticated>

      <Unauthenticated>
        <RedirectToLogin />
      </Unauthenticated>
    </>
  );
}

function RedirectToLogin() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-slate-600">Redirecting to login...</div>
    </div>
  );
}


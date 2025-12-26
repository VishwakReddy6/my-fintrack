"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Authenticated>
        <div className="min-h-screen bg-slate-50 flex">
          {/* Sidebar - hidden on mobile */}
          <Sidebar />
          
          {/* Main content area */}
          <div className="flex-1 flex flex-col md:ml-64 w-full md:w-auto">
            <Header />
            <main className="flex-1 overflow-y-auto bg-slate-50">
              <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
                {children}
              </div>
            </main>
          </div>
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


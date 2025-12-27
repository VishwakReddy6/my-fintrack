"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function SignupPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [justSignedIn, setJustSignedIn] = useState(false);
  
  // Check if user is authenticated
  const currentUser = useQuery(api.users.getCurrentUser);

  // Redirect if already authenticated
  useEffect(() => {
    if (currentUser !== undefined && currentUser !== null) {
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  // Handle redirect after successful sign-in
  useEffect(() => {
    if (justSignedIn && currentUser !== undefined && currentUser !== null) {
      router.push("/dashboard");
      setJustSignedIn(false);
    }
  }, [justSignedIn, currentUser, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signIn("password", { 
        email, 
        password, 
        flow: "signUp",
        name 
      });
      // Set flag to trigger redirect once auth state is confirmed
      setJustSignedIn(true);
      // Keep loading state while waiting for auth confirmation
    } catch (err: any) {
      const errorMessage = err?.message || "";
      if (errorMessage.includes("already exists")) {
        setError("An account with this email already exists. Please sign in instead.");
      } else {
        setError(errorMessage || "Failed to create account");
      }
      console.error(err);
      setIsLoading(false);
      setJustSignedIn(false);
    }
  };

  // Show loading or redirect if already authenticated
  if (currentUser !== undefined && currentUser !== null) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Create your account</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {isLoading && !error && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
          Creating your account... Please wait.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="text-slate-900 font-medium hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}

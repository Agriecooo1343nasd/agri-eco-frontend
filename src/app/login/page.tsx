"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { loginRequest } from "@/lib/api/auth";
import { ADMIN_ROLES } from "@/lib/auth-types";
import { isValidEmail } from "@/lib/auth-validation";
import { toast } from "sonner";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (session) => {
      login(session);
      toast.success("Login successful", {
        description: "Welcome back to Agri-Eco!",
      });

      const requestedRedirect = searchParams.get("redirect");
      const safeRedirect =
        requestedRedirect && requestedRedirect.startsWith("/")
          ? requestedRedirect
          : null;

      if (safeRedirect) {
        router.push(safeRedirect);
        return;
      }

      if (session.user.role && ADMIN_ROLES.includes(session.user.role)) {
        router.push("/admin");
        return;
      }

      router.push("/");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setFormError(null);

    if (!email.trim() || !password) {
      setFormError("Please fill in all required fields.");
      return;
    }

    if (!isValidEmail(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    loginMutation.mutate({ email: email.trim(), password });
  };

  const loading = loginMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-12 md:py-20 max-w-md mx-auto">
        <div className="bg-card border border-border rounded-md p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/10">
              <img
                src="/assets/logo/logo.png"
                alt="Agri-Eco Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold font-heading text-foreground">
              Welcome Back
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to your Agri-Eco account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-md text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-md text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-border text-primary focus:ring-primary/30"
                />
                Remember me
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline font-semibold"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-md text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  <LogIn className="h-4 w-4" /> Sign In
                </>
              )}
            </button>

            {formError && (
              <p className="text-sm text-destructive text-center">
                {formError}
              </p>
            )}
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-primary font-semibold hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LoginPage;

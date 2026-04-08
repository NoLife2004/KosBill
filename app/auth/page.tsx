"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signUp, signOut } from "@/lib/auth-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, CheckCircle } from "lucide-react";
import Link from "next/link";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  useEffect(() => {
    if (verified === "true") {
      alert("Email berhasil diverifikasi! Silakan masuk dengan akun Anda.");
    }
  }, [verified]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { data, error } = await signUp.email({
        name,
        email,
        password,
        callbackURL: "/auth?verified=true", // Verification link lands here
      });

      if (error) {
        setError(error.message || "Gagal mendaftar");
      } else {
        setSignupSuccess(true);
      }
    } catch (err) {
      setError("Gagal mendaftar");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { data, error } = await signIn.email({
        email,
        password,
      });

      if (error) {
        setError(error.message || "Failed to sign in");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError("Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="bg-blue-600 p-4 rounded-2xl shadow-lg">
          <Wallet className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-black tracking-tighter text-gray-900">
          KosBill Reminder
        </h1>
        <p className="text-muted-foreground text-center max-w-[300px]">
          The smartest way to track your boarding house bills.
        </p>
      </div>

      <Card className="w-full max-w-md border-2">
        <CardHeader className="text-center">
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in or create a new account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              {signupSuccess ? (
                <div className="text-center space-y-4 py-4 animate-in fade-in zoom-in duration-300">
                  <div className="flex justify-center">
                    <div className="bg-green-100 p-3 rounded-full">
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Registration Success!</h3>
                  <p className="text-gray-600">
                    We've sent a verification link to your email. Please verify your email before signing in.
                  </p>
                  <Button 
                    onClick={() => setSignupSuccess(false)} 
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                  >
                    Go to Sign In
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                  <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}

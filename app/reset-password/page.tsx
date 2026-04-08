"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("No reset token provided. Please request a new reset link.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      // Better Auth: apply password reset using the token from the email link
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token: token || "",
      });

      if (error) {
        setError(error.message || "Failed to reset password. The link may have expired or is invalid.");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth");
        }, 3000);
      }
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(err.message || "Terjadi kesalahan saat merubah kata sandi. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Card className="w-full max-w-md border-2">
        <CardHeader className="text-center">
          <CardTitle>Invalid Link</CardTitle>
          <CardDescription>The password reset link is invalid or expired.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
          </div>
          <Button asChild className="w-full h-11 bg-blue-600 hover:bg-blue-700">
            <Link href="/forgot-password">Request New Link</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-2">
      <CardHeader className="text-center">
        <CardTitle>Set New Password</CardTitle>
        <CardDescription>Enter a new secure password for your account</CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="text-center space-y-4 py-4">
            <div className="flex justify-center">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <p className="text-gray-900 font-bold">Password Reset Successfully!</p>
            <p className="text-gray-600">
              You will be redirected to the login page in a few seconds...
            </p>
            <Button asChild className="w-full h-11 bg-blue-600 hover:bg-blue-700">
              <Link href="/auth">Back to Login</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Updating password..." : "Reset Password"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="bg-blue-600 p-4 rounded-2xl shadow-lg">
          <Wallet className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-black tracking-tighter text-gray-900">
          KosBill Reminder
        </h1>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}

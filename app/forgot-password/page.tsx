"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Better Auth: request password reset link using the forgetPassword method
      // The redirectTo will be where the user lands after clicking the link in email
      const { error } = await (authClient as any).forgetPassword({
        email,
        redirectTo: "/reset-password",
      });

      if (error) {
        setError(error.message || "Gagal memproses permintaan. Silakan periksa kembali email Anda.");
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setError(err.message || "Terjadi kesalahan saat mengirim email. Pastikan sistem email aktif.");
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
      </div>

      <Card className="w-full max-w-md border-2">
        <CardHeader className="text-center">
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            {success
              ? "Check your email for the reset link"
              : "Enter your email address to receive a password reset link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="flex justify-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <p className="text-gray-600">
                We've sent a password reset link to <span className="font-semibold">{email}</span>. 
                Please check your inbox and spam folder.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
              <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "Sending link..." : "Send Reset Link"}
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/auth">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Link>
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

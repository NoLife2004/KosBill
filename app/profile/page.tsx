"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, User, Mail, Shield, Save, Loader2, Camera } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageUpload } from "@/components/ui/image-upload";

export default function ProfilePage() {
  const { data: session, isPending, refetch } = useSession() as any;
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/auth");
    }
    if (session?.user) {
      setName(session.user.name || "");
      setImage(session.user.image || "");
    }
  }, [session, isPending, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image }),
      });

      if (response.ok) {
        setSuccess(true);
        // Better Auth hook to refresh session data on client
        if (refetch) await refetch();
        else window.location.reload();
      } else {
        const data = await response.json();
        setError(data.error || "Gagal memperbarui profil");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  if (isPending || !session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-black tracking-tight">Pengaturan Profil</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-2 shadow-sm">
            <CardHeader>
              <CardTitle>Identitas Diri</CardTitle>
              <CardDescription>
                Kelola informasi profil yang dapat dilihat oleh orang lain.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                  <AvatarImage src={image} />
                  <AvatarFallback className="text-3xl font-bold bg-blue-100 text-blue-600">
                    {name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-4 w-full">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Foto Profil
                  </Label>
                  <ImageUpload
                    value={image}
                    onChange={(val) => setImage(typeof val === "string" ? val : val[0] || "")}
                    route="avatar"
                  />
                  <p className="text-[10px] text-muted-foreground italic">
                    Format: JPG, PNG, WebP (Maks. 2MB)
                  </p>
                </div>
              </div>

              <div className="grid gap-6 mt-8">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nama Lengkap
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama lengkap Anda"
                    className="h-12 text-lg font-medium"
                    required
                  />
                </div>

                <div className="space-y-2 opacity-70">
                  <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Terdaftar (Hanya Lihat)
                  </Label>
                  <Input
                    id="email"
                    value={session.user.email}
                    readOnly
                    className="h-12 bg-gray-100 dark:bg-gray-800 cursor-not-allowed font-medium"
                  />
                </div>

                <div className="space-y-2 opacity-70">
                  <Label htmlFor="role" className="text-sm font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Peran Akun
                  </Label>
                  <Input
                    id="role"
                    value={session.user.role || "User"}
                    readOnly
                    className="h-12 bg-gray-100 dark:bg-gray-800 cursor-not-allowed font-medium capitalize"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50/50 dark:bg-gray-800/50 flex flex-col gap-4 py-6">
              {error && <p className="text-red-500 text-sm font-medium w-full text-center">{error}</p>}
              {success && <p className="text-green-600 text-sm font-bold w-full text-center">Profil berhasil diperbarui!</p>}
              
              <Button type="submit" className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}

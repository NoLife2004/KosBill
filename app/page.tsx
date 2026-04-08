"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Bill, CreateBillData, UpdateBillData } from "@/lib/types";
import { DashboardStats } from "@/components/DashboardStats";
import { BillsList } from "@/components/BillsList";
import { BillForm } from "@/components/BillForm";
import { ReminderSystem } from "@/components/ReminderSystem";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { LayoutDashboard, LogOut, Wallet, UserCircle, Sun, Moon, ShieldCheck, Settings } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/auth");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchBills();
    }
  }, [session]);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bills");
      if (res.ok) {
        const data = await res.json();
        setBills(data);
      }
    } catch (error) {
      console.error("Failed to fetch bills:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBill = async (data: CreateBillData | UpdateBillData) => {
    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        fetchBills();
      }
    } catch (error) {
      console.error("Failed to add bill:", error);
    }
  };

  const handleUpdateBill = async (id: string, updates: Partial<Bill>) => {
    console.log("Updating bill:", id, updates);
    try {
      const res = await fetch(`/api/bills/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        console.log("Bill updated successfully");
        fetchBills();
      } else {
        const errorData = await res.json();
        console.error("Failed to update bill:", errorData);
      }
    } catch (error) {
      console.error("Failed to update bill:", error);
    }
  };

  const handleDeleteBill = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bill?")) return;
    try {
      const res = await fetch(`/api/bills/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchBills();
      }
    } catch (error) {
      console.error("Failed to delete bill:", error);
    }
  };

  if (isPending || !session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg shrink-0">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent truncate max-w-[120px] xs:max-w-[180px] sm:max-w-none">
              KosBill Reminder
            </h1>
          </div>

          <div className="flex items-center gap-1 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground mr-2 border-r pr-4 h-8">
              <Avatar className="w-6 h-6 border">
                <AvatarImage src={session.user.image || ""} />
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                  {session.user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate max-w-[120px] font-medium">{session.user.name}</span>
              {isAdmin && (
                <Badge variant="outline" className="ml-1 text-[10px] h-4 uppercase border-primary/30 text-primary">Admin</Badge>
              )}
            </div>

            <div className="flex items-center gap-0.5 sm:gap-2">
              <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-primary">
                <Link href="/profile">
                  <UserCircle className="w-5 h-5" />
                </Link>
              </Button>

              {isAdmin && (
                <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-primary">
                  <Link href="/admin">
                    <ShieldCheck className="w-5 h-5" />
                  </Link>
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-muted-foreground"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 px-2 sm:px-3"
                onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/auth") } })}
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <div className="w-full overflow-hidden">
          <ReminderSystem bills={bills} />
        </div>

        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Dashboard</h2>
          </div>
          <DashboardStats bills={bills} />
        </div>

        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">Your Bills</h2>
            </div>
          </div>
          <div className="w-full">
            <BillsList
              bills={bills}
              onUpdate={handleUpdateBill}
              onDelete={handleDeleteBill}
              onEdit={(bill) => {
                setEditingBill(bill);
                setIsFormOpen(true);
              }}
              onAdd={() => {
                setEditingBill(null);
                setIsFormOpen(true);
              }}
            />
          </div>
          {!loading && bills.length === 0 && (
            <div className="mt-8">
              <Alert className="border-l-4 shadow-xl bg-blue-50 dark:bg-blue-950/20 border-blue-500 text-blue-900 dark:text-blue-100 py-12 px-8 text-center flex flex-col items-center rounded-2xl transition-all hover:scale-[1.01]">
                <div className="bg-blue-100 dark:bg-blue-900/40 p-5 rounded-full mb-6">
                  <Wallet className="h-10 w-10 text-blue-600 dark:text-blue-400 opacity-90" />
                </div>
                <AlertTitle className="text-2xl font-black mb-3 tracking-tight">Belum Ada Tagihan</AlertTitle>
                <AlertDescription className="text-base font-medium opacity-80 mb-8 max-w-md mx-auto leading-relaxed">
                  Pantau pengeluaran kos Anda dengan mudah. Tambahkan tagihan pertama Anda sekarang!
                </AlertDescription>
                <Button onClick={() => setIsFormOpen(true)} size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg text-white font-bold h-14 px-10 rounded-xl transition-all active:scale-95">
                  Tambah Tagihan Baru
                </Button>
              </Alert>
            </div>
          )}
        </div>
      </main>


      <BillForm
        bill={editingBill}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingBill(null);
        }}
        onSubmit={async (data) => {
          if (editingBill) {
            await handleUpdateBill(editingBill.id, data as Partial<Bill>);
          } else {
            await handleAddBill(data as CreateBillData);
          }
        }}
      />
    </div>
  );
}

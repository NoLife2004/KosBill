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
import { LayoutDashboard, LogOut, Wallet, UserCircle, Sun, Moon } from "lucide-react";

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

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
    try {
      const res = await fetch(`/api/bills/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        fetchBills();
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

  const handleSeedData = async () => {
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      if (res.ok) {
        fetchBills();
      }
    } catch (error) {
      console.error("Failed to seed bills:", error);
    }
  };

  if (isPending || !session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="sticky top-0 z-30 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              KosBill Reminder
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-gray-600"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
             <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground mr-4 border-l pl-4">
              <UserCircle className="w-4 h-4" />
              <span>{session.user.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/auth") } })}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <ReminderSystem bills={bills} />

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <LayoutDashboard className="w-5 h-5 text-blue-600" />
            <h2 className="text-2xl font-bold">Dashboard</h2>
          </div>
          <DashboardStats bills={bills} />
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              <h2 className="text-2xl font-bold">Your Bills</h2>
            </div>
          </div>
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
          {!loading && bills.length === 0 && (
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={handleSeedData} className="text-blue-600">
                Seed Sample Bills (Demo Data)
              </Button>
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

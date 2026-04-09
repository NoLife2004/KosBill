"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Debt } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Wallet, Calendar, User, ArrowUpRight, ArrowDownLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SharePage() {
  const { id } = useParams();
  const [debt, setDebt] = useState<Debt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/share/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setDebt(data);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!debt || (debt as any).error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full text-center p-8">
          <CardTitle className="text-destructive mb-4">Record Not Found</CardTitle>
          <p className="text-muted-foreground">This share link is invalid or has expired.</p>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const isDebt = debt.type === "debt";

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8 flex items-center justify-center">
      <Card className="max-w-md w-full shadow-2xl overflow-hidden">
        <div className={`h-2 w-full ${isDebt ? "bg-red-500" : "bg-green-500"}`} />
        <CardHeader className="pb-2 text-center">
          <div className={`mx-auto p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 ${isDebt ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
            {isDebt ? <ArrowUpRight className="h-8 w-8" /> : <ArrowDownLeft className="h-8 w-8" />}
          </div>
          <CardTitle className="text-2xl font-black">
            {isDebt ? "You Owe Me" : "Payment Request"}
          </CardTitle>
          <Badge className="mt-2" variant={debt.status === "paid" ? "success" : "warning"}>
            {debt.status.toUpperCase()}
          </Badge>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-4">
          <div className="text-center space-y-1">
            <div className="text-4xl font-black tracking-tighter">
              {formatCurrency(debt.remainingAmount)}
            </div>
            <p className="text-sm text-muted-foreground">
              Remaining from total {formatCurrency(debt.amount)}
            </p>
          </div>

          <div className="space-y-3 bg-muted/50 p-4 rounded-xl border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2"><User className="h-4 w-4" /> From</span>
              <span className="font-bold">{(debt as any).user?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2"><User className="h-4 w-4" /> To</span>
              <span className="font-bold">{(debt as any).contact?.name}</span>
            </div>
            {debt.dueDate && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" /> Due Date</span>
                <span className="font-bold">{format(new Date(debt.dueDate), "PPP")}</span>
              </div>
            )}
          </div>

          {debt.note && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</p>
              <p className="text-sm italic">{debt.note}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-muted/50 border-t p-6 flex flex-col gap-3">
          <p className="text-[10px] text-muted-foreground text-center">
            This is an automated bill reminder from KosBill Debt Tracker.
          </p>
          <Button className="w-full font-bold" onClick={() => window.print()}>
            Print / Save PDF
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

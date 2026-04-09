"use client";

import { Debt } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, ArrowUpRight, ArrowDownLeft, Calendar, User, MoreVertical, Trash2, Edit2, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface DebtListProps {
  debts: Debt[];
  onAddPayment: (debt: Debt) => void;
  onEdit: (debt: Debt) => void;
  onDelete: (id: string) => void;
}

export function DebtList({ debts, onAddPayment, onEdit, onDelete }: DebtListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (debts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-lg border border-dashed text-center">
        <Wallet className="h-10 w-10 text-muted-foreground mb-4 opacity-20" />
        <h3 className="text-lg font-semibold text-muted-foreground">No records found</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Start tracking your debts and credits by adding a new entry.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {debts.map((debt) => (
        <Card key={debt.id} className="overflow-hidden border-l-4 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${debt.type === "debt" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                  {debt.type === "debt" ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="font-bold flex items-center gap-1.5">
                    {debt.contact?.name || "Unknown Person"}
                    <Badge variant={debt.status === "paid" ? "success" : debt.status === "partial" ? "warning" : "destructive"}>
                      {debt.status}
                    </Badge>
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> {debt.type === "debt" ? "I owe them" : "They owe me"}</span>
                    {debt.dueDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Due: {format(new Date(debt.dueDate), "dd MMM yyyy")}</span>}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-lg font-black ${debt.type === "debt" ? "text-red-600" : "text-green-600"}`}>
                  {formatCurrency(debt.remainingAmount)}
                </div>
                <div className="text-[10px] text-muted-foreground line-through opacity-50">
                  {formatCurrency(debt.amount)}
                </div>
              </div>

              <div className="flex items-center gap-1 ml-4">
                {debt.status !== "paid" && (
                  <Button variant="outline" size="sm" onClick={() => onAddPayment(debt)}>
                    <CreditCard className="h-4 w-4 mr-1.5" /> Pay
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(debt)}>
                      <Edit2 className="h-4 w-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => onDelete(debt.id)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {debt.note && (
              <div className="mt-3 text-sm text-muted-foreground border-t pt-2 italic">
                {debt.note}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

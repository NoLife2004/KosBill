"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft, Scale, Wallet } from "lucide-react";

interface SummaryCardsProps {
  totalIOwe: number;
  totalOwedMe: number;
  netBalance: number;
}

export function SummaryCards({ totalIOwe, totalOwedMe, netBalance }: SummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-l-4 border-l-red-500 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total I Owe</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(totalIOwe)}</div>
          <p className="text-xs text-muted-foreground mt-1">Money you need to pay back</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-500 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Owed to Me</CardTitle>
          <ArrowDownLeft className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalOwedMe)}</div>
          <p className="text-xs text-muted-foreground mt-1">Money people owe you</p>
        </CardContent>
      </Card>

      <Card className={`border-l-4 shadow-sm ${netBalance >= 0 ? "border-l-blue-500" : "border-l-orange-500"}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Net Balance</CardTitle>
          <Scale className={`h-4 w-4 ${netBalance >= 0 ? "text-blue-500" : "text-orange-500"}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netBalance >= 0 ? "text-blue-600" : "text-orange-600"}`}>
            {formatCurrency(netBalance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Your overall financial standing</p>
        </CardContent>
      </Card>
    </div>
  );
}

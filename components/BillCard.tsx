"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bill } from "@/lib/types";
import { format, isPast, isToday, addDays, isWithinInterval } from "date-fns";
import { Check, Trash2, Edit2, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface BillCardProps {
  bill: Bill;
  onUpdate: (id: string, updates: Partial<Bill>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (bill: Bill) => void;
}

export function BillCard({ bill, onUpdate, onDelete, onEdit }: BillCardProps) {
  const [loading, setLoading] = useState(false);
  const today = new Date();
  const dueDate = new Date(bill.dueDate);
  const threeDaysFromNow = addDays(today, 3);

  const isOverdue = isPast(dueDate) && !isToday(dueDate) && bill.status === "unpaid";
  const isNearDue = isWithinInterval(dueDate, { start: today, end: threeDaysFromNow }) && bill.status === "unpaid";
  const isPaid = bill.status === "paid";

  const getStatusBadge = () => {
    if (isPaid) return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
    if (isOverdue) return <Badge variant="destructive">Overdue</Badge>;
    if (isNearDue) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Due Soon</Badge>;
    return <Badge variant="outline">Unpaid</Badge>;
  };

  const getCardBorder = () => {
    if (isPaid) return "border-green-200 bg-green-50/20";
    if (isOverdue) return "border-red-200 bg-red-50/20";
    if (isNearDue) return "border-yellow-200 bg-yellow-50/20";
    return "";
  };

  const handleToggleStatus = async () => {
    setLoading(true);
    await onUpdate(bill.id, { status: bill.status === "paid" ? "unpaid" : "paid" });
    setLoading(false);
  };

  return (
    <Card className={`transition-all ${getCardBorder()}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">{bill.billName}</CardTitle>
        {getStatusBadge()}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">
          Rp {bill.amount.toLocaleString("id-ID")}
        </div>
        <div className="flex items-center text-sm text-muted-foreground gap-1">
          {isOverdue ? <AlertCircle className="w-4 h-4 text-red-600" /> : <Clock className="w-4 h-4" />}
          Due: {format(dueDate, "dd MMM yyyy")}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          size="sm"
          variant={isPaid ? "outline" : "default"}
          className={`flex-1 ${isPaid ? "" : "bg-green-600 hover:bg-green-700"}`}
          onClick={handleToggleStatus}
          disabled={loading}
        >
          {isPaid ? <Clock className="w-4 h-4 mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
          {isPaid ? "Mark Unpaid" : "Mark Paid"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onEdit(bill)} disabled={loading}>
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => onDelete(bill.id)}
          disabled={loading}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

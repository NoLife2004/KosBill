"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bill } from "@/lib/types";
import { format, isPast, isToday, addDays, isWithinInterval } from "date-fns";
import { Check, Trash2, Edit2, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
    if (isPaid) return <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20">Paid</Badge>;
    if (isOverdue) return <Badge variant="destructive">Overdue</Badge>;
    if (isNearDue) return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20">Due Soon</Badge>;
    return <Badge variant="outline">Unpaid</Badge>;
  };

  const getCardBorder = () => {
    if (isPaid) return "border-green-500/20 bg-green-500/5 opacity-80";
    if (isOverdue) return "border-destructive/20 bg-destructive/5";
    if (isNearDue) return "border-amber-500/20 bg-amber-500/5";
    return "bg-card";
  };

  const handleMarkPaid = async () => {
    setLoading(true);
    await onUpdate(bill.id, { status: "paid" });
    setLoading(false);
  };

  return (
    <Card className={`transition-all hover:shadow-md h-full w-full max-w-full overflow-hidden flex flex-col ${getCardBorder()}`}>
      <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0 gap-2">
        <CardTitle className="text-lg font-bold truncate pr-2 break-words leading-tight whitespace-normal max-w-[70%]">
          {bill.billName}
        </CardTitle>
        <div className="flex-shrink-0 mt-0.5">{getStatusBadge()}</div>
      </CardHeader>
      <CardContent className="pb-4 flex-grow">
        <div className="text-2xl font-bold mb-2 truncate text-primary">
          Rp {bill.amount.toLocaleString("id-ID")}
        </div>
        <div className="flex items-center text-sm text-muted-foreground gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 min-w-0">
            {isOverdue ? <AlertCircle className="w-4 h-4 text-destructive shrink-0" /> : <Clock className="w-4 h-4 shrink-0" />}
            <span className="truncate">Due: {format(dueDate, "dd MMM yyyy")}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-0 mt-auto">
        {!isPaid ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                className="flex-1 min-w-0 bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                disabled={loading}
              >
                <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
                <span className="truncate">Paid</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[90vw] sm:max-w-md rounded-xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Pembayaran</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin tagihan <strong>{bill.billName}</strong> sebesar <strong>Rp {bill.amount.toLocaleString("id-ID")}</strong> sudah dibayar?
                  <br /><br />
                  <span className="text-destructive font-medium italic">Tindakan ini tidak dapat dibatalkan.</span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-lg">Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleMarkPaid} className="bg-green-600 hover:bg-green-700 text-white rounded-lg">
                  Ya, Sudah Bayar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 min-w-0 border-green-500/50 text-green-600 cursor-default hover:bg-transparent"
            disabled
          >
            <Check className="w-4 h-4 mr-2" />
            Completed
          </Button>
        )}
        
        {!isPaid && (
          <Button size="sm" variant="outline" className="shrink-0" onClick={() => onEdit(bill)} disabled={loading}>
            <Edit2 className="w-4 h-4" />
          </Button>
        )}
        
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(bill.id)}
          disabled={loading}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}


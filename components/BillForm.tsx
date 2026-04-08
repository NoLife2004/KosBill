"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bill, CreateBillData, UpdateBillData } from "@/lib/types";
import { format } from "date-fns";

interface BillFormProps {
  bill?: Bill | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBillData | UpdateBillData) => Promise<void>;
}

export function BillForm({ bill, isOpen, onClose, onSubmit }: BillFormProps) {
  const [billName, setBillName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (bill) {
      setBillName(bill.billName);
      setAmount(bill.amount.toString());
      setDueDate(format(new Date(bill.dueDate), "yyyy-MM-dd"));
    } else {
      setBillName("");
      setAmount("");
      setDueDate(format(new Date(), "yyyy-MM-dd"));
    }
  }, [bill, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        billName,
        amount: Number(amount),
        dueDate: new Date(dueDate).toISOString(),
      });
      onClose();
    } catch (error) {
      console.error("Form submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{bill ? "Edit Bill" : "Add New Bill"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="billName">Bill Name</Label>
            <Input
              id="billName"
              placeholder="e.g. Electricity, Wifi"
              value={billName}
              onChange={(e) => setBillName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (Rp)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : bill ? "Update Bill" : "Add Bill"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

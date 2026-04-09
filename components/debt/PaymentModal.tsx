"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Debt } from "@/lib/types";
import { Wallet, Info, FileImage } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt | null;
  onSubmit: (data: any) => Promise<void>;
}

export function PaymentModal({ isOpen, onClose, debt, onSubmit }: PaymentModalProps) {
  const [formData, setFormData] = useState({
    amount: "",
    note: "",
    proofImage: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!debt) return;
    setLoading(true);
    try {
      await onSubmit({
        debtId: debt.id,
        amount: Number(formData.amount),
        note: formData.note,
        proofImage: formData.proofImage,
        date: new Date(formData.date),
      });
      onClose();
      setFormData({ amount: "", note: "", proofImage: "", date: new Date().toISOString().split("T")[0] });
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!debt) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Record Payment
          </DialogTitle>
          <DialogDescription>
            Record a partial or full payment for this record.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 p-3 rounded-lg flex items-start gap-3 text-sm mb-4 border">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{debt.contact?.name}</p>
            <p className="text-muted-foreground">Remaining: <span className="font-bold text-primary">{formatCurrency(debt.remainingAmount)}</span></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pay-amount">Amount (IDR)</Label>
              <Input
                id="pay-amount"
                type="number"
                placeholder="50.000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                max={debt.remainingAmount}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pay-date">Date</Label>
              <Input
                id="pay-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pay-note">Note (Optional)</Label>
            <Textarea
              id="pay-note"
              placeholder="e.g. Paid via Bank Transfer"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileImage className="h-4 w-4" /> Proof of Payment (Optional)
            </Label>
            <div className="p-1">
              <ImageUpload
                value={formData.proofImage}
                onChange={(url) => setFormData({ ...formData, proofImage: url })}
                route="upload"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="font-bold">
              {loading ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

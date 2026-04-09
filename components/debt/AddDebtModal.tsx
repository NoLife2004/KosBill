"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Contact, Debt } from "@/lib/types";
import { PlusCircle, UserPlus, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface AddDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  editingDebt?: Debt | null;
  contacts: Contact[];
  onAddContact: () => void;
}

export function AddDebtModal({ isOpen, onClose, onSubmit, editingDebt, contacts, onAddContact }: AddDebtModalProps) {
  const [formData, setFormData] = useState({
    contactId: "",
    type: "debt" as "debt" | "credit",
    amount: "",
    dueDate: undefined as Date | undefined,
    note: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingDebt) {
      setFormData({
        contactId: editingDebt.contactId,
        type: editingDebt.type,
        amount: editingDebt.amount.toString(),
        dueDate: editingDebt.dueDate ? new Date(editingDebt.dueDate) : undefined,
        note: editingDebt.note || "",
      });
    } else {
      setFormData({
        contactId: "",
        type: "debt",
        amount: "",
        dueDate: undefined,
        note: "",
      });
    }
  }, [editingDebt, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        amount: Number(formData.amount),
      });
      onClose();
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingDebt ? "Edit Record" : "Add New Debt/Credit"}</DialogTitle>
          <DialogDescription>
            Record money you owe or money someone owes you.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Who is it?</Label>
            <div className="flex gap-2">
              <Select
                value={formData.contactId}
                onValueChange={(val) => setFormData({ ...formData, contactId: val })}
                required
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" size="icon" onClick={onAddContact}>
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="flex bg-muted p-1 rounded-lg gap-1">
                <Button
                  type="button"
                  variant={formData.type === "debt" ? "default" : "ghost"}
                  className="flex-1 h-8 text-xs gap-1"
                  onClick={() => setFormData({ ...formData, type: "debt" })}
                >
                  <ArrowUpRight className="h-3 w-3" /> Debt
                </Button>
                <Button
                  type="button"
                  variant={formData.type === "credit" ? "default" : "ghost"}
                  className="flex-1 h-8 text-xs gap-1"
                  onClick={() => setFormData({ ...formData, type: "credit" })}
                >
                  <ArrowDownLeft className="h-3 w-3" /> Credit
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (IDR)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="100.000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Due Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.dueDate && "text-muted-foreground"
                  )}
                >
                  {formData.dueDate ? format(formData.dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.dueDate}
                  onSelect={(date) => setFormData({ ...formData, dueDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="What is this for?"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : editingDebt ? "Update Record" : "Save Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

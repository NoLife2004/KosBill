"use client";

import { useState } from "react";
import { Bill } from "@/lib/types";
import { BillCard } from "@/components/BillCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, History, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isPast, isToday } from "date-fns";

interface BillsListProps {
  bills: Bill[];
  onUpdate: (id: string, updates: Partial<Bill>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (bill: Bill) => void;
  onAdd: () => void;
}

export function BillsList({ bills, onUpdate, onDelete, onEdit, onAdd }: BillsListProps) {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<string>("asc");

  const filterAndSort = (billList: Bill[]) => {
    return billList
      .filter((bill) => bill.billName.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
  };

  const pendingBills = filterAndSort(bills.filter(b => b.status === "unpaid"));
  const paidBills = filterAndSort(bills.filter(b => b.status === "paid"));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 bg-card p-4 rounded-xl shadow-sm border">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search bills..."
            className="pl-9 w-full bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-between">
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-full sm:w-[150px] bg-background">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Soonest Due</SelectItem>
              <SelectItem value="desc">Latest Due</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={onAdd} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            New Bill
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 p-1 bg-muted rounded-lg mb-6">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Pending ({pendingBills.length})</span>
          </TabsTrigger>
          <TabsTrigger value="paid" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            <span>Paid History ({paidBills.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pendingBills.length > 0 ? (
              pendingBills.map((bill) => (
                <BillCard
                  key={bill.id}
                  bill={bill}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))
            ) : (
              <EmptyState onAdd={onAdd} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="paid">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paidBills.length > 0 ? (
              paidBills.map((bill) => (
                <BillCard
                  key={bill.id}
                  bill={bill}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl border-muted text-muted-foreground bg-muted/20">
                <History className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-lg font-medium">No paid bills yet</p>
                <p className="text-sm">Complete your pending bills to see them here</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl border-muted text-muted-foreground bg-muted/20">
      <Plus className="w-12 h-12 mb-4 opacity-20" />
      <p className="text-lg font-medium">No pending bills found</p>
      <p className="text-sm">Add your first bill to start tracking</p>
      <Button variant="outline" size="sm" onClick={onAdd} className="mt-4 border-primary text-primary">
        Add Bill Now
      </Button>
    </div>
  );
}

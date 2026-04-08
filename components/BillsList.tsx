"use client";

import { useState } from "react";
import { Bill } from "@/lib/types";
import { BillCard } from "@/components/BillCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isPast, isToday } from "date-fns";

interface BillsListProps {
  bills: Bill[];
  onUpdate: (id: string, updates: Partial<Bill>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (bill: Bill) => void;
  onAdd: () => void;
}

export function BillsList({ bills, onUpdate, onDelete, onEdit, onAdd }: BillsListProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<string>("asc");

  const filteredBills = bills
    .filter((bill) => {
      const matchesSearch = bill.billName.toLowerCase().includes(search.toLowerCase());
      const dueDate = new Date(bill.dueDate);
      const isOverdue = isPast(dueDate) && !isToday(dueDate) && bill.status === "unpaid";

      if (filterStatus === "all") return matchesSearch;
      if (filterStatus === "paid") return matchesSearch && bill.status === "paid";
      if (filterStatus === "unpaid") return matchesSearch && bill.status === "unpaid";
      if (filterStatus === "overdue") return matchesSearch && isOverdue;
      return matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search bills..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex w-full md:w-auto gap-2 items-center">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bills</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Soonest Due</SelectItem>
              <SelectItem value="desc">Latest Due</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Bill
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredBills.length > 0 ? (
          filteredBills.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl border-muted text-muted-foreground">
            <Plus className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">No bills found</p>
            <p className="text-sm">Add your first bill to start tracking</p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bill } from "@/lib/types";
import { isPast, isToday, addDays, isWithinInterval } from "date-fns";

interface DashboardStatsProps {
  bills: Bill[];
}

export function DashboardStats({ bills }: DashboardStatsProps) {
  const unpaidBills = bills.filter((b) => b.status === "unpaid");
  const totalUnpaidAmount = unpaidBills.reduce((acc, curr) => acc + curr.amount, 0);

  const today = new Date();
  const threeDaysFromNow = addDays(today, 3);

  const upcomingBills = unpaidBills.filter((b) => {
    const dueDate = new Date(b.dueDate);
    return isWithinInterval(dueDate, { start: today, end: threeDaysFromNow });
  });

  const overdueBills = unpaidBills.filter((b) => {
    const dueDate = new Date(b.dueDate);
    return isPast(dueDate) && !isToday(dueDate);
  });

  const stats = [
    {
      title: "Total Unpaid",
      value: `Rp ${totalUnpaidAmount.toLocaleString("id-ID")}`,
      description: `${unpaidBills.length} pending bills`,
      color: "text-destructive",
    },
    {
      title: "Upcoming (3 Days)",
      value: upcomingBills.length.toString(),
      description: "Bills due soon",
      color: "text-yellow-600 dark:text-yellow-500",
    },
    {
      title: "Overdue",
      value: overdueBills.length.toString(),
      description: "Immediate action required",
      color: "text-destructive font-bold",
    },
    {
      title: "Paid This Month",
      value: bills.filter((b) => b.status === "paid").length.toString(),
      description: "Great progress!",
      color: "text-green-600 dark:text-green-400",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-xl md:text-2xl font-bold truncate ${stat.color}`}>{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


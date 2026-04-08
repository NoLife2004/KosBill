"use client";

import { useEffect, useState } from "react";
import { Bill } from "@/lib/types";
import { isToday, addDays, isWithinInterval, isPast, format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReminderSystemProps {
  bills: Bill[];
}

export function ReminderSystem({ bills }: ReminderSystemProps) {
  const [reminders, setReminders] = useState<{ id: string; message: string; type: "overdue" | "dueSoon" | "dueToday" }[]>([]);
  const [notificationsPermission, setNotificationsPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setNotificationsPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationsPermission(permission);
    }
  };

  useEffect(() => {
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const threeDaysFromNow = addDays(today, 3);

    const activeReminders: { id: string; message: string; type: "overdue" | "dueSoon" | "dueToday" }[] = [];

    bills.forEach((bill) => {
      if (bill.status === "paid") return;

      const dueDate = new Date(bill.dueDate);

      if (isToday(dueDate)) {
        activeReminders.push({
          id: bill.id,
          message: `${bill.billName} is due TODAY!`,
          type: "dueToday",
        });
        sendNotification(`Due Today: ${bill.billName}`, `Amount: Rp ${bill.amount.toLocaleString()}`);
      } else if (isPast(dueDate)) {
        activeReminders.push({
          id: bill.id,
          message: `${bill.billName} is OVERDUE! (Due: ${format(dueDate, "dd MMM")})`,
          type: "overdue",
        });
        sendNotification(`Overdue: ${bill.billName}`, `Please pay your Rp ${bill.amount.toLocaleString()} bill!`);
      } else if (isWithinInterval(dueDate, { start: today, end: threeDaysFromNow })) {
        activeReminders.push({
          id: bill.id,
          message: `${bill.billName} is due soon on ${format(dueDate, "dd MMM")}`,
          type: "dueSoon",
        });
        if (isToday(addDays(dueDate, -1))) {
           sendNotification(`Due Tomorrow: ${bill.billName}`, `Amount: Rp ${bill.amount.toLocaleString()}`);
        }
      }
    });

    setReminders(activeReminders);
  }, [bills]);

  const sendNotification = (title: string, body: string) => {
    if (notificationsPermission === "granted") {
      new Notification(title, { body, icon: "/icon-192.png" });
    }
  };

  if (reminders.length === 0 && notificationsPermission === "granted") return null;

  return (
    <div className="space-y-4 mb-8">
      {notificationsPermission === "default" && (
        <Alert className="border-l-4 shadow-md bg-blue-50 dark:bg-blue-950/30 border-blue-500 text-blue-900 dark:text-blue-200 py-4 px-5 rounded-xl transition-all hover:shadow-lg">
          <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
            <div>
              <AlertTitle className="text-base font-bold mb-1">🔔 Aktifkan Pengingat Desktop</AlertTitle>
              <AlertDescription className="text-sm font-medium opacity-80">
                Dapatkan notifikasi langsung di komputer Anda saat tagihan mendekati jatuh tempo!
              </AlertDescription>
            </div>
            <Button size="sm" onClick={requestPermission} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-6 shrink-0 shadow-sm">
              Aktifkan Sekarang
            </Button>
          </div>
        </Alert>
      )}

      {reminders.map((reminder) => (
        <Alert
          key={reminder.id}
          className={`border-l-4 shadow-md py-4 px-5 rounded-xl transition-all hover:shadow-lg ${
            reminder.type === "overdue"
              ? "bg-red-50 dark:bg-red-950/30 border-red-500 text-red-900 dark:text-red-200"
              : reminder.type === "dueToday"
              ? "bg-orange-50 dark:bg-orange-950/30 border-orange-500 text-orange-900 dark:text-orange-200"
              : "bg-amber-50 dark:bg-amber-950/30 border-amber-500 text-amber-900 dark:text-amber-200"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full shrink-0 ${
              reminder.type === "overdue" ? "bg-red-100 dark:bg-red-900/30" : 
              reminder.type === "dueToday" ? "bg-orange-100 dark:bg-orange-900/30" : 
              "bg-amber-100 dark:bg-amber-900/30"
            }`}>
              <AlertTriangle
                className={`h-5 w-5 ${
                  reminder.type === "overdue"
                    ? "text-red-600 dark:text-red-400"
                    : reminder.type === "dueToday"
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              />
            </div>
            <div>
              <AlertTitle className="text-base font-bold mb-1">
                {reminder.type === "overdue" ? "🚨 TAGIHAN TERLAMBAT" : reminder.type === "dueToday" ? "⚠️ JATUH TEMPO HARI INI" : "⏳ SEGERA JATUH TEMPO"}
              </AlertTitle>
              <AlertDescription className="text-sm font-medium opacity-80 leading-relaxed">
                {reminder.message}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
}

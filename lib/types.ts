export type BillStatus = "paid" | "unpaid";

export interface Bill {
  id: string;
  userId: string;
  billName: string;
  amount: number;
  dueDate: Date;
  status: BillStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBillData {
  billName: string;
  amount: number;
  dueDate: string; // ISO string from client
}

export interface UpdateBillData {
  billName?: string;
  amount?: number;
  dueDate?: string;
  status?: BillStatus;
}

import type { PaymentMethod } from '@prisma/client';

export interface CreateExpenseDto {
  title: string;
  amount: number;
  description?: string;
  transactionDate: Date;
  categoryId: string;
  merchantName?: string;
  paymentMethod?: PaymentMethod;
}

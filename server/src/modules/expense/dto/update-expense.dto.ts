import type { PaymentMethod } from '@prisma/client';

export interface UpdateExpenseDto {
  title?: string;
  amount?: number;
  description?: string | null;
  transactionDate?: Date;
  categoryId?: string;
  merchantName?: string | null;
  paymentMethod?: PaymentMethod;
}

/*
  Warnings:

  - You are about to drop the column `icon` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `isDefault` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `sortOrder` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `customSettings` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `defaultBudgetPeriod` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the `budgets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `goals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `receipts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `recurring_transactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reports` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transactions` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'MOBILE_PAYMENT', 'OTHER');

-- DropForeignKey
ALTER TABLE "budgets" DROP CONSTRAINT "budgets_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "budgets" DROP CONSTRAINT "budgets_userId_fkey";

-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_parentId_fkey";

-- DropForeignKey
ALTER TABLE "goals" DROP CONSTRAINT "goals_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "goals" DROP CONSTRAINT "goals_userId_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_userId_fkey";

-- DropForeignKey
ALTER TABLE "receipts" DROP CONSTRAINT "receipts_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "receipts" DROP CONSTRAINT "receipts_userId_fkey";

-- DropForeignKey
ALTER TABLE "recurring_transactions" DROP CONSTRAINT "recurring_transactions_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "recurring_transactions" DROP CONSTRAINT "recurring_transactions_userId_fkey";

-- DropForeignKey
ALTER TABLE "reports" DROP CONSTRAINT "reports_userId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_recurringTransactionId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_userId_fkey";

-- DropIndex
DROP INDEX "categories_parentId_idx";

-- DropIndex
DROP INDEX "categories_userId_type_idx";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "icon",
DROP COLUMN "isDefault",
DROP COLUMN "parentId",
DROP COLUMN "sortOrder",
DROP COLUMN "type";

-- AlterTable
ALTER TABLE "settings" DROP COLUMN "customSettings",
DROP COLUMN "defaultBudgetPeriod";

-- DropTable
DROP TABLE "budgets";

-- DropTable
DROP TABLE "goals";

-- DropTable
DROP TABLE "notifications";

-- DropTable
DROP TABLE "receipts";

-- DropTable
DROP TABLE "recurring_transactions";

-- DropTable
DROP TABLE "reports";

-- DropTable
DROP TABLE "transactions";

-- DropEnum
DROP TYPE "BudgetPeriod";

-- DropEnum
DROP TYPE "CategoryType";

-- DropEnum
DROP TYPE "GoalStatus";

-- DropEnum
DROP TYPE "GoalType";

-- DropEnum
DROP TYPE "NotificationChannel";

-- DropEnum
DROP TYPE "NotificationType";

-- DropEnum
DROP TYPE "RecurrenceFrequency";

-- DropEnum
DROP TYPE "ReportFormat";

-- DropEnum
DROP TYPE "ReportStatus";

-- DropEnum
DROP TYPE "ReportType";

-- DropEnum
DROP TYPE "TransactionStatus";

-- DropEnum
DROP TYPE "TransactionType";

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "transactionDate" DATE NOT NULL,
    "merchantName" TEXT,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "expenses_userId_idx" ON "expenses"("userId");

-- CreateIndex
CREATE INDEX "expenses_categoryId_idx" ON "expenses"("categoryId");

-- CreateIndex
CREATE INDEX "expenses_transactionDate_idx" ON "expenses"("transactionDate");

-- CreateIndex
CREATE INDEX "expenses_merchantName_idx" ON "expenses"("merchantName");

-- CreateIndex
CREATE INDEX "expenses_userId_deletedAt_idx" ON "expenses"("userId", "deletedAt");

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "IncomeSource" AS ENUM ('SALARY', 'BUSINESS', 'FREELANCING', 'INVESTMENT', 'OTHER');

-- CreateTable
CREATE TABLE "incomes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" "IncomeSource" NOT NULL DEFAULT 'OTHER',
    "title" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "description" TEXT,
    "transactionDate" DATE NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incomes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "incomes_userId_idx" ON "incomes"("userId");

-- CreateIndex
CREATE INDEX "incomes_transactionDate_idx" ON "incomes"("transactionDate");

-- CreateIndex
CREATE INDEX "incomes_userId_deletedAt_idx" ON "incomes"("userId", "deletedAt");

-- AddForeignKey
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

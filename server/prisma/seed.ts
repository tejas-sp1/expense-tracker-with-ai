import { PrismaClient, PaymentMethod, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { slugify } from '../src/shared/utils/slug.js';

const prisma = new PrismaClient();

const DEMO_EMAIL = 'demo@expense-tracker.local';
const DEMO_PASSWORD = 'Demo1234!';

const categories = [
  { name: 'Food & Dining', color: '#ef4444' },
  { name: 'Transportation', color: '#f97316' },
  { name: 'Shopping', color: '#eab308' },
  { name: 'Entertainment', color: '#8b5cf6' },
  { name: 'Bills & Utilities', color: '#3b82f6' },
  { name: 'Healthcare', color: '#10b981' },
  { name: 'Other', color: '#6b7280' },
];

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {
      passwordHash,
      emailVerified: true,
      deletedAt: null,
    },
    create: {
      email: DEMO_EMAIL,
      passwordHash,
      firstName: 'Demo',
      lastName: 'User',
      role: UserRole.USER,
      emailVerified: true,
      authProvider: 'LOCAL',
      settings: { create: {} },
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@expense-tracker.local' },
    update: { deletedAt: null },
    create: {
      email: 'admin@expense-tracker.local',
      passwordHash: await bcrypt.hash('Admin1234!', 12),
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      emailVerified: true,
      authProvider: 'LOCAL',
      settings: { create: {} },
    },
  });

  for (const category of categories) {
    const slug = slugify(category.name);
    await prisma.category.upsert({
      where: {
        userId_slug: {
          userId: user.id,
          slug,
        },
      },
      update: { color: category.color, name: category.name, deletedAt: null },
      create: {
        userId: user.id,
        name: category.name,
        slug,
        color: category.color,
        isDefault: true,
      },
    });
  }

  const existingTransactions = await prisma.expense.count({
    where: { userId: user.id, deletedAt: null },
  });

  if (existingTransactions === 0) {
    const food = await prisma.category.findFirst({
      where: { userId: user.id, slug: slugify('Food & Dining'), deletedAt: null },
    });
    const transport = await prisma.category.findFirst({
      where: { userId: user.id, slug: slugify('Transportation'), deletedAt: null },
    });
    const bills = await prisma.category.findFirst({
      where: { userId: user.id, slug: slugify('Bills & Utilities'), deletedAt: null },
    });

    if (food && transport && bills) {
      const today = new Date();
      const daysAgo = (n: number) => {
        const d = new Date(today);
        d.setDate(d.getDate() - n);
        return d;
      };

      await prisma.expense.createMany({
        data: [
          {
            userId: user.id,
            title: 'Grocery shopping',
            amount: 85.5,
            description: 'Weekly groceries',
            transactionDate: daysAgo(1),
            categoryId: food.id,
            paymentMethod: PaymentMethod.DEBIT_CARD,
          },
          {
            userId: user.id,
            title: 'Gas station',
            amount: 45.0,
            transactionDate: daysAgo(2),
            categoryId: transport.id,
            paymentMethod: PaymentMethod.CREDIT_CARD,
          },
          {
            userId: user.id,
            title: 'Electric bill',
            amount: 120.0,
            transactionDate: daysAgo(5),
            categoryId: bills.id,
            paymentMethod: PaymentMethod.BANK_TRANSFER,
          },
          {
            userId: user.id,
            title: 'Restaurant dinner',
            amount: 62.75,
            description: 'Dinner with friends',
            transactionDate: daysAgo(3),
            categoryId: food.id,
            paymentMethod: PaymentMethod.CASH,
          },
        ],
      });
    }
  }

  console.log('Seed completed.');
  console.log(`Demo user: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log('Admin user: admin@expense-tracker.local / Admin1234!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

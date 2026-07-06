import { useState } from 'react';
import { format } from 'date-fns';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategories } from '@/features/categories/hooks/use-categories';
import {
  useCreateExpense,
  useDeleteExpense,
  useExpenses,
  useUpdateExpense,
} from '@/features/expenses/hooks/use-expenses';
import type { Expense, ExpenseFilters } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ExpenseFormData {
  title: string;
  amount: string;
  description: string;
  date: string;
  categoryId: string;
}

const emptyForm = (): ExpenseFormData => ({
  title: '',
  amount: '',
  description: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  categoryId: '',
});

function ExpenseForm({
  initial,
  onSubmit,
  isPending,
}: {
  initial?: ExpenseFormData;
  onSubmit: (data: ExpenseFormData) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<ExpenseFormData>(initial ?? emptyForm());
  const { data: categories } = useCategories();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Grocery shopping"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={form.categoryId}
          onValueChange={(value) => setForm({ ...form, categoryId: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Add notes..."
          rows={3}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save Expense'}
      </Button>
    </form>
  );
}

function expenseToForm(expense: Expense): ExpenseFormData {
  return {
    title: expense.title,
    amount: String(expense.amount),
    description: expense.description ?? '',
    date: expense.date.slice(0, 10),
    categoryId: expense.categoryId,
  };
}

export function ExpenseList() {
  const [filters, setFilters] = useState<ExpenseFilters>({ page: 1, limit: 10 });
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const { data, isLoading, isError } = useExpenses(filters);
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();
  const { data: categories } = useCategories();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleCreate = (form: ExpenseFormData) => {
    createMutation.mutate(
      {
        title: form.title,
        amount: parseFloat(form.amount),
        description: form.description || undefined,
        date: form.date,
        categoryId: form.categoryId,
      },
      { onSuccess: () => setCreateOpen(false) },
    );
  };

  const handleUpdate = (form: ExpenseFormData) => {
    if (!editingExpense) return;
    updateMutation.mutate(
      {
        id: editingExpense.id,
        data: {
          title: form.title,
          amount: parseFloat(form.amount),
          description: form.description || undefined,
          date: form.date,
          categoryId: form.categoryId,
        },
      },
      { onSuccess: () => setEditingExpense(null) },
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Expenses</CardTitle>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            <ExpenseForm onSubmit={handleCreate} isPending={createMutation.isPending} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Select
            value={filters.categoryId ?? 'all'}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                categoryId: value === 'all' ? undefined : value,
                page: 1,
              }))
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-sm text-muted-foreground">
            Failed to load expenses. Check that the server is running.
          </p>
        )}

        {data && data.items.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No expenses found. Add your first expense to get started.
          </p>
        )}

        {data && data.items.length > 0 && (
          <div className="divide-y rounded-lg border">
            {data.items.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between gap-4 p-4 hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{expense.title}</p>
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: expense.category.color,
                        color: expense.category.color,
                      }}
                    >
                      {expense.category.name}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(expense.date)}
                    {expense.description && ` · ${expense.description}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{formatCurrency(Number(expense.amount))}</span>
                  <Dialog
                    open={editingExpense?.id === expense.id}
                    onOpenChange={(open) => !open && setEditingExpense(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingExpense(expense)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Expense</DialogTitle>
                      </DialogHeader>
                      <ExpenseForm
                        initial={expenseToForm(expense)}
                        onSubmit={handleUpdate}
                        isPending={updateMutation.isPending}
                      />
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete expense?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete &quot;{expense.title}&quot;. This action
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(expense.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}

        {data && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              Page {data.meta.page} of {data.meta.totalPages} ({data.meta.total} total)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.meta.page <= 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={data.meta.page >= data.meta.totalPages}
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

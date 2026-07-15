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
import {
  useCreateIncome,
  useDeleteIncome,
  useIncomeList,
  useUpdateIncome,
} from '@/features/income/hooks/use-income';
import type { Income, IncomeFilters, IncomeSource } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

const INCOME_SOURCES: { value: IncomeSource; label: string }[] = [
  { value: 'SALARY', label: 'Salary' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'FREELANCING', label: 'Freelancing' },
  { value: 'INVESTMENT', label: 'Investment' },
  { value: 'OTHER', label: 'Other' },
];

const sourceLabel = (source: IncomeSource) =>
  INCOME_SOURCES.find((s) => s.value === source)?.label ?? source;

interface IncomeFormData {
  title: string;
  amount: string;
  description: string;
  transactionDate: string;
  source: IncomeSource;
}

const emptyForm = (): IncomeFormData => ({
  title: '',
  amount: '',
  description: '',
  transactionDate: format(new Date(), 'yyyy-MM-dd'),
  source: 'SALARY',
});

function IncomeForm({
  initial,
  onSubmit,
  isPending,
}: {
  initial?: IncomeFormData;
  onSubmit: (data: IncomeFormData) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<IncomeFormData>(initial ?? emptyForm());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="income-title">Title</Label>
        <Input
          id="income-title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Monthly salary"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="income-amount">Amount</Label>
          <Input
            id="income-amount"
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
          <Label htmlFor="income-date">Date</Label>
          <Input
            id="income-date"
            type="date"
            value={form.transactionDate}
            onChange={(e) => setForm({ ...form, transactionDate: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Source</Label>
        <Select
          value={form.source}
          onValueChange={(value) => setForm({ ...form, source: value as IncomeSource })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            {INCOME_SOURCES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="income-description">Description (optional)</Label>
        <Textarea
          id="income-description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Add notes..."
          rows={3}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save Income'}
      </Button>
    </form>
  );
}

function incomeToForm(income: Income): IncomeFormData {
  return {
    title: income.title,
    amount: String(income.amount),
    description: income.description ?? '',
    transactionDate: income.transactionDate.slice(0, 10),
    source: income.source,
  };
}

export function IncomeList() {
  const [filters, setFilters] = useState<IncomeFilters>({ page: 1, limit: 10 });
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  const { data, isLoading, isError } = useIncomeList(filters);
  const createMutation = useCreateIncome();
  const updateMutation = useUpdateIncome();
  const deleteMutation = useDeleteIncome();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleCreate = (form: IncomeFormData) => {
    createMutation.mutate(
      {
        title: form.title,
        amount: parseFloat(form.amount),
        description: form.description || undefined,
        transactionDate: form.transactionDate,
        source: form.source,
      },
      { onSuccess: () => setCreateOpen(false) },
    );
  };

  const handleUpdate = (form: IncomeFormData) => {
    if (!editingIncome) return;
    updateMutation.mutate(
      {
        id: editingIncome.id,
        data: {
          title: form.title,
          amount: parseFloat(form.amount),
          description: form.description || undefined,
          transactionDate: form.transactionDate,
          source: form.source,
        },
      },
      { onSuccess: () => setEditingIncome(null) },
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Income</CardTitle>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add Income
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Income</DialogTitle>
            </DialogHeader>
            <IncomeForm onSubmit={handleCreate} isPending={createMutation.isPending} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Search income..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Select
            value={filters.source ?? 'all'}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                source: value === 'all' ? undefined : (value as IncomeSource),
                page: 1,
              }))
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {INCOME_SOURCES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
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
            Failed to load income. Check that the server is running.
          </p>
        )}

        {data && data.items.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No income recorded yet. Add your first income entry to get started.
          </p>
        )}

        {data && data.items.length > 0 && (
          <div className="divide-y rounded-lg border">
            {data.items.map((income) => (
              <div
                key={income.id}
                className="flex items-center justify-between gap-4 p-4 hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{income.title}</p>
                    <Badge variant="outline">{sourceLabel(income.source)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(income.transactionDate)}
                    {income.description && ` · ${income.description}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-green-600">
                    +{formatCurrency(Number(income.amount))}
                  </span>
                  <Dialog
                    open={editingIncome?.id === income.id}
                    onOpenChange={(open) => !open && setEditingIncome(null)}
                  >
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setEditingIncome(income)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Income</DialogTitle>
                      </DialogHeader>
                      <IncomeForm
                        initial={incomeToForm(income)}
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
                        <AlertDialogTitle>Delete income?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete &quot;{income.title}&quot;. This action
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(income.id)}
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

import { useState } from 'react';
import { format } from 'date-fns';
import { Pencil, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  useBudgets,
  useCreateBudget,
  useDeleteBudget,
  useUpdateBudget,
} from '@/features/budget/hooks/use-budget';
import type { Budget, BudgetPeriod } from '@/types';
import { formatCurrency } from '@/lib/utils';

const PERIODS: { value: BudgetPeriod; label: string }[] = [
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'YEARLY', label: 'Yearly' },
  { value: 'CUSTOM', label: 'Custom range' },
];

const periodLabel = (period: BudgetPeriod) =>
  PERIODS.find((p) => p.value === period)?.label ?? period;

interface BudgetFormData {
  name: string;
  amount: string;
  categoryId: string;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  alertThreshold: string;
}

const emptyForm = (): BudgetFormData => ({
  name: '',
  amount: '',
  categoryId: 'all',
  period: 'MONTHLY',
  startDate: format(new Date(), 'yyyy-MM-dd'),
  endDate: '',
  alertThreshold: '80',
});

function budgetToForm(budget: Budget): BudgetFormData {
  return {
    name: budget.name,
    amount: String(budget.amount),
    categoryId: budget.categoryId ?? 'all',
    period: budget.period,
    startDate: budget.startDate.slice(0, 10),
    endDate: budget.endDate ? budget.endDate.slice(0, 10) : '',
    alertThreshold: String(budget.alertThreshold),
  };
}

function BudgetForm({
  initial,
  onSubmit,
  isPending,
}: {
  initial?: BudgetFormData;
  onSubmit: (data: BudgetFormData) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<BudgetFormData>(initial ?? emptyForm());
  const { data: categories } = useCategories();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="budget-name">Name</Label>
        <Input
          id="budget-name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Groceries budget"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budget-amount">Amount</Label>
          <Input
            id="budget-amount"
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
          <Label htmlFor="budget-threshold">Alert at (%)</Label>
          <Input
            id="budget-threshold"
            type="number"
            min="1"
            max="100"
            value={form.alertThreshold}
            onChange={(e) => setForm({ ...form, alertThreshold: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={form.categoryId}
          onValueChange={(value) => setForm({ ...form, categoryId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All categories (overall budget)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories (overall budget)</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Period</Label>
        <Select
          value={form.period}
          onValueChange={(value) => setForm({ ...form, period: value as BudgetPeriod })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budget-start">
            {form.period === 'CUSTOM' ? 'Start date' : 'Start date (tracking begins)'}
          </Label>
          <Input
            id="budget-start"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            required
          />
        </div>
        {form.period === 'CUSTOM' && (
          <div className="space-y-2">
            <Label htmlFor="budget-end">End date</Label>
            <Input
              id="budget-end"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              required
            />
          </div>
        )}
      </div>
      {form.period !== 'CUSTOM' && (
        <p className="text-xs text-muted-foreground">
          Progress is tracked against the current {form.period.toLowerCase()} period
          automatically — it resets each new week/month/quarter/year.
        </p>
      )}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save Budget'}
      </Button>
    </form>
  );
}

function ProgressBar({ percentage, isOverBudget }: { percentage: number; isOverBudget: boolean }) {
  const clamped = Math.min(percentage, 100);
  const color = isOverBudget ? 'bg-destructive' : percentage >= 80 ? 'bg-amber-500' : 'bg-primary';

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function BudgetManager() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const { data, isLoading, isError } = useBudgets({ isActive: true });
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const deleteMutation = useDeleteBudget();

  const handleCreate = (form: BudgetFormData) => {
    createMutation.mutate(
      {
        name: form.name,
        amount: parseFloat(form.amount),
        categoryId: form.categoryId === 'all' ? undefined : form.categoryId,
        period: form.period,
        startDate: form.startDate,
        endDate: form.period === 'CUSTOM' ? form.endDate : undefined,
        alertThreshold: parseInt(form.alertThreshold, 10),
      },
      { onSuccess: () => setCreateOpen(false) },
    );
  };

  const handleUpdate = (form: BudgetFormData) => {
    if (!editingBudget) return;
    updateMutation.mutate(
      {
        id: editingBudget.id,
        data: {
          name: form.name,
          amount: parseFloat(form.amount),
          categoryId: form.categoryId === 'all' ? undefined : form.categoryId,
          period: form.period,
          startDate: form.startDate,
          endDate: form.period === 'CUSTOM' ? form.endDate : undefined,
          alertThreshold: parseInt(form.alertThreshold, 10),
        },
      },
      { onSuccess: () => setEditingBudget(null) },
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Budgets</CardTitle>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Budget</DialogTitle>
            </DialogHeader>
            <BudgetForm onSubmit={handleCreate} isPending={createMutation.isPending} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-sm text-muted-foreground">
            Failed to load budgets. Check that the server is running.
          </p>
        )}

        {data && data.items.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No budgets set up yet. Create one to start tracking spending limits.
          </p>
        )}

        {data && data.items.length > 0 && (
          <div className="space-y-4">
            {data.items.map((budget) => (
              <div key={budget.id} className="space-y-2 rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium">{budget.name}</p>
                      <Badge variant="outline">{periodLabel(budget.period)}</Badge>
                      {budget.category ? (
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: budget.category.color,
                            color: budget.category.color,
                          }}
                        >
                          {budget.category.name}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">All categories</Badge>
                      )}
                      {budget.progress.isOverBudget && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Over budget
                        </Badge>
                      )}
                      {!budget.progress.isOverBudget && budget.progress.isNearThreshold && (
                        <Badge className="gap-1 border-amber-500 text-amber-600" variant="outline">
                          <AlertTriangle className="h-3 w-3" />
                          Near limit
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Dialog
                      open={editingBudget?.id === budget.id}
                      onOpenChange={(open) => !open && setEditingBudget(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingBudget(budget)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Budget</DialogTitle>
                        </DialogHeader>
                        <BudgetForm
                          initial={budgetToForm(budget)}
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
                          <AlertDialogTitle>Delete budget?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete &quot;{budget.name}&quot;. This action
                            cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(budget.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <ProgressBar
                  percentage={budget.progress.percentageUsed}
                  isOverBudget={budget.progress.isOverBudget}
                />

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {formatCurrency(budget.progress.spentAmount)} of{' '}
                    {formatCurrency(budget.progress.budgetAmount)} spent
                  </span>
                  <span className={budget.progress.isOverBudget ? 'font-medium text-destructive' : ''}>
                    {budget.progress.isOverBudget
                      ? `${formatCurrency(Math.abs(budget.progress.remainingAmount))} over`
                      : `${formatCurrency(budget.progress.remainingAmount)} left`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useState } from 'react';
import { Pencil, Plus, Trash2, PiggyBank, CheckCircle2 } from 'lucide-react';
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
  useContributeGoal,
  useCreateGoal,
  useDeleteGoal,
  useGoals,
  useUpdateGoal,
} from '@/features/goals/hooks/use-goals';
import type { SavingsGoal } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface GoalFormData {
  name: string;
  description: string;
  targetAmount: string;
  targetDate: string;
  initialAmount: string;
}

const emptyForm = (): GoalFormData => ({
  name: '',
  description: '',
  targetAmount: '',
  targetDate: '',
  initialAmount: '0',
});

function goalToForm(goal: SavingsGoal): GoalFormData {
  return {
    name: goal.name,
    description: goal.description ?? '',
    targetAmount: String(goal.targetAmount),
    targetDate: goal.targetDate ? goal.targetDate.slice(0, 10) : '',
    initialAmount: String(goal.currentAmount),
  };
}

function GoalForm({
  initial,
  isEdit,
  onSubmit,
  isPending,
}: {
  initial?: GoalFormData;
  isEdit?: boolean;
  onSubmit: (data: GoalFormData) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<GoalFormData>(initial ?? emptyForm());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="goal-name">Name</Label>
        <Input
          id="goal-name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Emergency fund"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="goal-target">Target amount</Label>
          <Input
            id="goal-target"
            type="number"
            step="0.01"
            min="0.01"
            value={form.targetAmount}
            onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="goal-date">Target date (optional)</Label>
          <Input
            id="goal-date"
            type="date"
            value={form.targetDate}
            onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
          />
        </div>
      </div>
      {!isEdit && (
        <div className="space-y-2">
          <Label htmlFor="goal-initial">Starting amount (optional)</Label>
          <Input
            id="goal-initial"
            type="number"
            step="0.01"
            min="0"
            value={form.initialAmount}
            onChange={(e) => setForm({ ...form, initialAmount: e.target.value })}
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="goal-description">Description (optional)</Label>
        <Textarea
          id="goal-description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          placeholder="What is this goal for?"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save Goal'}
      </Button>
    </form>
  );
}

function ContributeForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (amount: number) => void;
  isPending: boolean;
}) {
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<'add' | 'withdraw'>('add');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (Number.isNaN(parsed) || parsed <= 0) return;
    onSubmit(mode === 'add' ? parsed : -parsed);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Type</Label>
        <Select value={mode} onValueChange={(v) => setMode(v as 'add' | 'withdraw')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="add">Add funds</SelectItem>
            <SelectItem value="withdraw">Withdraw funds</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contribute-amount">Amount</Label>
        <Input
          id="contribute-amount"
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Saving...' : mode === 'add' ? 'Add Funds' : 'Withdraw Funds'}
      </Button>
    </form>
  );
}

function ProgressBar({ percentage, isCompleted }: { percentage: number; isCompleted: boolean }) {
  const color = isCompleted ? 'bg-green-600' : 'bg-primary';
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );
}

export function SavingsGoalsManager() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [contributingGoal, setContributingGoal] = useState<SavingsGoal | null>(null);

  const { data, isLoading, isError } = useGoals();
  const createMutation = useCreateGoal();
  const updateMutation = useUpdateGoal();
  const contributeMutation = useContributeGoal();
  const deleteMutation = useDeleteGoal();

  const handleCreate = (form: GoalFormData) => {
    createMutation.mutate(
      {
        name: form.name,
        description: form.description || undefined,
        targetAmount: parseFloat(form.targetAmount),
        targetDate: form.targetDate || undefined,
        initialAmount: form.initialAmount ? parseFloat(form.initialAmount) : undefined,
      },
      { onSuccess: () => setCreateOpen(false) },
    );
  };

  const handleUpdate = (form: GoalFormData) => {
    if (!editingGoal) return;
    updateMutation.mutate(
      {
        id: editingGoal.id,
        data: {
          name: form.name,
          description: form.description || undefined,
          targetAmount: parseFloat(form.targetAmount),
          targetDate: form.targetDate || undefined,
        },
      },
      { onSuccess: () => setEditingGoal(null) },
    );
  };

  const handleContribute = (amount: number) => {
    if (!contributingGoal) return;
    contributeMutation.mutate(
      { id: contributingGoal.id, data: { amount } },
      { onSuccess: () => setContributingGoal(null) },
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Savings Goals</CardTitle>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Savings Goal</DialogTitle>
            </DialogHeader>
            <GoalForm onSubmit={handleCreate} isPending={createMutation.isPending} />
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
            Failed to load savings goals. Check that the server is running.
          </p>
        )}

        {data && data.items.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No savings goals yet. Create one to start tracking progress toward something you're
            saving for.
          </p>
        )}

        {data && data.items.length > 0 && (
          <div className="space-y-4">
            {data.items.map((goal) => (
              <div key={goal.id} className="space-y-2 rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <PiggyBank className="h-4 w-4 text-muted-foreground" />
                      <p className="truncate font-medium">{goal.name}</p>
                      {goal.progress.isCompleted && (
                        <Badge className="gap-1 bg-green-600 hover:bg-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          Completed
                        </Badge>
                      )}
                      {!goal.progress.isCompleted && goal.progress.isOnTrack === false && (
                        <Badge variant="destructive">Behind schedule</Badge>
                      )}
                    </div>
                    {goal.description && (
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Dialog
                      open={contributingGoal?.id === goal.id}
                      onOpenChange={(open) => !open && setContributingGoal(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setContributingGoal(goal)}
                        >
                          Add / Withdraw
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{goal.name}</DialogTitle>
                        </DialogHeader>
                        <ContributeForm
                          onSubmit={handleContribute}
                          isPending={contributeMutation.isPending}
                        />
                      </DialogContent>
                    </Dialog>
                    <Dialog
                      open={editingGoal?.id === goal.id}
                      onOpenChange={(open) => !open && setEditingGoal(null)}
                    >
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setEditingGoal(goal)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Goal</DialogTitle>
                        </DialogHeader>
                        <GoalForm
                          initial={goalToForm(goal)}
                          isEdit
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
                          <AlertDialogTitle>Delete goal?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete &quot;{goal.name}&quot;. This action
                            cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(goal.id)}
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
                  percentage={goal.progress.percentageComplete}
                  isCompleted={goal.progress.isCompleted}
                />

                <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                  <span>
                    {formatCurrency(goal.progress.currentAmount)} of{' '}
                    {formatCurrency(goal.progress.targetAmount)} saved (
                    {goal.progress.percentageComplete.toFixed(0)}%)
                  </span>
                  {goal.targetDate && (
                    <span>
                      Target: {formatDate(goal.targetDate)}
                      {goal.progress.daysRemaining !== null &&
                        ` (${
                          goal.progress.daysRemaining >= 0
                            ? `${goal.progress.daysRemaining} days left`
                            : 'overdue'
                        })`}
                    </span>
                  )}
                </div>
                {!goal.progress.isCompleted && goal.progress.estimatedCompletionDate && (
                  <p className="text-xs text-muted-foreground">
                    At your current pace, estimated to reach this goal by{' '}
                    {formatDate(goal.progress.estimatedCompletionDate)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

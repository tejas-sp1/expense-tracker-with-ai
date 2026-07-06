import { Wallet, LogOut } from 'lucide-react';
import { DashboardSummary } from '@/features/dashboard/components/DashboardSummary';
import { ExpenseList } from '@/features/expenses/components/ExpenseList';
import { CategoryManager } from '@/features/categories/components/CategoryManager';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-none">Expense Tracker</h1>
              <p className="text-xs text-muted-foreground">Manage your spending with ease</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                {user.role === 'ADMIN' && <Badge variant="secondary">Admin</Badge>}
                <Button variant="ghost" size="icon" onClick={() => logout()} title="Sign out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto space-y-6 px-4 py-8">
        <DashboardSummary />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ExpenseList />
          </div>
          <div>
            <CategoryManager />
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useAuth } from '@/context/AuthContext';
import { LoginButton } from '@/components/auth/LoginButton';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Header } from '@/components/layout/Header';
import { ExpenseForm } from '@/components/expensify/ExpenseForm';
import { CategoryManager } from '@/components/expensify/CategoryManager';
import { RecentExpensesList } from '@/components/expensify/RecentExpensesList';
import { Rocket } from 'lucide-react';

export default function HomePage() {
  const { firebaseUser, currentUser, loading, isAllowed, role } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <LoadingSpinner size={64} />
        <p className="mt-4 text-lg text-muted-foreground">Loading Your Space...</p>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-6">
        <div className="text-center space-y-6 bg-card p-10 rounded-xl shadow-2xl">
          <Rocket className="mx-auto h-20 w-20 text-primary animate-pulse" />
          <h1 className="text-5xl font-extrabold font-headline text-foreground">
            Welcome to Receipt Rocket!
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Effortlessly track your expenses and manage receipts. Sign in to get started.
          </p>
          <LoginButton />
        </div>
      </div>
    );
  }

  if (!isAllowed) {
    return <AccessDenied />;
  }

  // Authenticated and allowed user
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ExpenseForm />
            <RecentExpensesList />
          </div>
          <div className="lg:col-span-1 space-y-8">
            <CategoryManager />
            {/* Future components like budget trackers or reports can go here */}
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} Receipt Rocket. Fly high with your finances!
      </footer>
    </div>
  );
}

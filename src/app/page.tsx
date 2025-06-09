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

  if (firebaseUser && !isAllowed) {
    return <AccessDenied />;
  }

  // Authenticated and allowed user
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* ExpenseForm is always rendered */}
        <ExpenseForm />

        {/* Conditionally render admin components below ExpenseForm in their own box */}
        {firebaseUser && role === 'admin' && (
          <div className="mt-8 space-y-8"> {/* Added margin-top for separation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> {/* Adjusted grid for admin components */}
              {/* Admin components */}
              <RecentExpensesList />
              <CategoryManager />
            </div>
          </div>
        )}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} Receipt Rocket. Fly high with your finances!
      </footer>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { getUserExpenses, getUserCategories } from '@/services/expenseService';
import type { Expense, Category } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { format } from 'date-fns';
import * as LucideIcons from 'lucide-react';
import { DollarSign, ListChecks, CalendarDays, Receipt } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function RecentExpensesList() {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser?.uid) {
        setIsLoading(true);
        try {
          const [userExpenses, userCategories] = await Promise.all([
            getUserExpenses(db, currentUser.uid),
            getUserCategories(db, currentUser.uid)
          ]);
          setExpenses(userExpenses);
          setCategories(userCategories);
        } catch (error) {
          console.error("Error fetching data:", error);
          // Handle toast notification if needed
        } finally {
          setIsLoading(false);
        }
      } else {
        setExpenses([]);
        setCategories([]);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentUser?.uid]);

  const getCategoryInfo = (categoryId: string): Category | undefined => {
    return categories.find(cat => cat.id === categoryId);
  };
  
  const getIconComponent = (iconName: keyof typeof LucideIcons | string | undefined): React.ElementType => {
    if (!iconName) return LucideIcons.Tag;
    return LucideIcons[iconName as keyof typeof LucideIcons] || LucideIcons.Tag;
  };

  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4 font-headline flex items-center gap-2"><ListChecks /> Recent Expenses</h2>
        <LoadingSpinner className="mt-8" />
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="mt-8 text-center">
        <h2 className="text-2xl font-semibold mb-4 font-headline flex items-center justify-center gap-2"><ListChecks /> Recent Expenses</h2>
        <Card className="mt-4 shadow-none border-dashed">
            <CardContent className="p-10">
                <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No expenses found. Add your first expense to see it here!</p>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-6 font-headline flex items-center gap-2"><ListChecks /> Recent Expenses</h2>
      <ScrollArea className="h-[600px] pr-4"> {/* Adjust height as needed */}
        <div className="space-y-6">
          {expenses.map(expense => {
            const categoryInfo = getCategoryInfo(expense.category);
            const CategoryIcon = getIconComponent(categoryInfo?.iconName);
            return (
              <Card key={expense.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="font-headline text-xl">{expense.vendor}</CardTitle>
                      <CardDescription className="flex items-center gap-1.5 mt-1">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        {format(expense.date.toDate(), 'PPP')}
                      </CardDescription>
                    </div>
                    <Badge variant={expense.type === 'debit' ? 'destructive' : 'default'} className="capitalize">
                      {expense.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-2xl font-semibold text-primary">
                      {expense.amount.toLocaleString(undefined, { style: 'currency', currency: expense.currency })}
                    </p>
                     {categoryInfo && (
                        <Badge variant="secondary" className="flex items-center gap-1.5 py-1 px-2.5">
                            <CategoryIcon className="h-4 w-4" />
                            {categoryInfo.name}
                        </Badge>
                     )}
                  </div>

                  {expense.images && expense.images.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Receipts:</p>
                      <ScrollArea className="w-full whitespace-nowrap rounded-md">
                        <div className="flex w-max space-x-2 pb-2">
                          {expense.images.map(img => (
                            <div key={img.id} className="h-20 w-20 relative shrink-0 rounded-md overflow-hidden border">
                              <Image 
                                src={img.url} 
                                alt={img.name} 
                                layout="fill" 
                                objectFit="cover"
                                data-ai-hint="receipt document"
                              />
                            </div>
                          ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    </div>
                  )}
                </CardContent>
                {expense.companyAccount && (
                  <CardFooter>
                    <Badge variant="outline">Company Account</Badge>
                  </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

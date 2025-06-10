import type { Category } from '@/types';
import type { LucideIcon } from 'lucide-react';
import { Utensils, Car, Home, ShoppingCart, Briefcase, HeartPulse, BookOpen, Gift, CircleDollarSign } from 'lucide-react';

export const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'MXN', label: 'MXN - Mexican Peso' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'GBP', label: 'GBP - British Pound' },
];

export const INITIAL_CATEGORIES: Omit<Category, 'isCustom' | 'userId'>[] = [
  { id: 'food-dining', name: 'Food & Dining', iconName: 'Utensils' },
  { id: 'transportation', name: 'Transportation', iconName: 'Car' },
  { id: 'housing', name: 'Housing & Utilities', iconName: 'Home' },
  { id: 'shopping', name: 'Shopping', iconName: 'ShoppingCart' },
  { id: 'business', name: 'Business Services', iconName: 'Briefcase' },
  { id: 'health', name: 'Health & Wellness', iconName: 'HeartPulse' },
  { id: 'education', name: 'Education', iconName: 'BookOpen' },
  { id: 'gifts', name: 'Gifts & Donations', iconName: 'Gift' },
  { id: 'other', name: 'Other', iconName: 'CircleDollarSign' },
];

export const TRANSACTION_TYPES = [
  { value: 'debit', label: 'Debit (Expense)' },
  { value: 'credit', label: 'Credit (Income)' },
];

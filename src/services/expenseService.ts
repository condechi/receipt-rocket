import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
  doc,
  deleteDoc,
  orderBy,
  limit,
  DocumentData,
  WriteBatch,
  writeBatch,
} from 'firebase/firestore';
import type { Expense, Category, StoredImage } from '@/types';
import { INITIAL_CATEGORIES } from '@/lib/constants';

// For Expenses
export const addExpenseToFirestore = async (
  db: Firestore,
  userId: string,
  expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'images'> & { images: StoredImage[] }
): Promise<string> => {
  const expenseCol = collection(db, 'expenses');
  const newExpense: Omit<Expense, 'id'> = {
    ...expenseData,
    userId,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };
  const docRef = await addDoc(expenseCol, newExpense);
  return docRef.id;
};

export const getUserExpenses = async (db: Firestore, userId: string): Promise<Expense[]> => {
  const expensesCol = collection(db, 'expenses');
  const q = query(expensesCol, where('userId', '==', userId), orderBy('date', 'desc'), limit(50));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
};


// For Categories
const userCategoriesCollection = (db: Firestore, userId: string) => 
  collection(db, 'users', userId, 'categories');

export const getUserCategories = async (db: Firestore, userId: string): Promise<Category[]> => {
  const customCategoriesQuery = query(userCategoriesCollection(db, userId), orderBy('name'));
  const querySnapshot = await getDocs(customCategoriesQuery);
  const customCategories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), isCustom: true, userId } as Category));
  
  const allCategories = [...INITIAL_CATEGORIES.map(cat => ({...cat, isCustom: false})), ...customCategories];
  // Sort all categories alphabetically by name
  allCategories.sort((a, b) => a.name.localeCompare(b.name));
  return allCategories;
};

export const addCategoryToFirestore = async (
  db: Firestore,
  userId: string,
  categoryData: Pick<Category, 'name' | 'iconName'>
): Promise<string> => {
  const newCategory: Omit<Category, 'id' | 'isCustom' | 'userId'> & { userId: string, isCustom: boolean, createdAt: Timestamp } = {
    ...categoryData,
    userId,
    isCustom: true,
    createdAt: serverTimestamp() as Timestamp,
  };
  const docRef = await addDoc(userCategoriesCollection(db, userId), newCategory);
  return docRef.id;
};

export const removeCategoryFromFirestore = async (
  db: Firestore,
  userId: string,
  categoryId: string
): Promise<void> => {
  // Before deleting a category, ensure it's not used in expenses or handle accordingly.
  // For simplicity, this example directly deletes it.
  // A more robust solution might archive it or prevent deletion if in use.
  const categoryDocRef = doc(db, 'users', userId, 'categories', categoryId);
  await deleteDoc(categoryDocRef);
};

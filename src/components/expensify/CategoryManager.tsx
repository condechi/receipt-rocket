"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { getUserCategories, addCategoryToFirestore, removeCategoryFromFirestore } from '@/services/expenseService';
import type { Category } from '@/types';
import * as LucideIcons from 'lucide-react'; // Import all icons
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, PlusCircle, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/alert-dialog"

const iconNames = Object.keys(LucideIcons).filter(key => key !== 'createLucideIcon' && key !== 'LucideIconProvider' && key !== 'icons') as (keyof typeof LucideIcons)[];


export function CategoryManager() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState<keyof typeof LucideIcons>('Tag');
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = async () => {
    if (currentUser?.uid) {
      setIsLoading(true);
      try {
        const userCategories = await getUserCategories(db, currentUser.uid);
        setCategories(userCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({ title: "Error", description: "Could not load categories.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchCategories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid]);

  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid || !newCategoryName.trim()) return;

    setIsLoading(true);
    try {
      await addCategoryToFirestore(db, currentUser.uid, { name: newCategoryName.trim(), iconName: newCategoryIcon });
      setNewCategoryName('');
      setNewCategoryIcon('Tag');
      toast({ title: "Success", description: "Category added." });
      await fetchCategories(); // Refresh list
    } catch (error) {
      console.error("Error adding category:", error);
      toast({ title: "Error", description: "Could not add category.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCategory = async (categoryId: string) => {
    if (!currentUser?.uid) return;
    setIsLoading(true);
    try {
      await removeCategoryFromFirestore(db, currentUser.uid, categoryId);
      toast({ title: "Success", description: "Category removed." });
      await fetchCategories(); // Refresh list
    } catch (error) {
      console.error("Error removing category:", error);
      toast({ title: "Error", description: "Could not remove category. It might be in use.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const getIconComponent = (iconName: keyof typeof LucideIcons | string): React.ElementType => {
    return LucideIcons[iconName as keyof typeof LucideIcons] || LucideIcons.Tag;
  };


  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-xl">
          <Tag className="h-6 w-6 text-primary" />
          Manage Categories
        </CardTitle>
        <CardDescription>Add or remove your custom expense categories.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddCategory} className="space-y-4 mb-6">
          <div className="space-y-1">
            <Label htmlFor="newCategoryName">New Category Name</Label>
            <Input
              id="newCategoryName"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g., Groceries"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="newCategoryIcon">Icon</Label>
            <Select value={newCategoryIcon} onValueChange={(value) => setNewCategoryIcon(value as keyof typeof LucideIcons)} disabled={isLoading}>
              <SelectTrigger id="newCategoryIcon">
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-60">
                {iconNames.map(icon => {
                  const IconComponent = getIconComponent(icon);
                  return (
                    <SelectItem key={icon} value={icon}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        {icon}
                      </div>
                    </SelectItem>
                  );
                })}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isLoading || !newCategoryName.trim()} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </form>

        <Label>Your Categories</Label>
        <ScrollArea className="h-60 mt-2 rounded-md border p-2">
          {isLoading && !categories.length ? <p className="text-sm text-muted-foreground text-center py-4">Loading categories...</p> : null}
          {!isLoading && !categories.length ? <p className="text-sm text-muted-foreground text-center py-4">No categories found. Add one above!</p> : null}
          
          <ul className="space-y-2">
            {categories.map(category => {
              const IconComponent = getIconComponent(category.iconName);
              return (
                <li key={category.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                    <span>{category.name}</span>
                    {!category.isCustom && <span className="text-xs text-muted-foreground">(default)</span>}
                  </div>
                  {category.isCustom && (
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isLoading} className="text-destructive hover:text-destructive/80">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the category "{category.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveCategory(category.id)} className="bg-destructive hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

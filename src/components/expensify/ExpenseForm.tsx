"use client";

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ImageUpload } from './ImageUpload';
import { VendorAutocomplete } from './VendorAutocomplete';
import { useAuth } from '@/context/AuthContext';
import { addExpenseToFirestore, getUserCategories } from '@/services/expenseService'; // Assuming this service exists
import { db } from '@/lib/firebase';
import { CURRENCIES, TRANSACTION_TYPES } from '@/lib/constants';
import type { UploadedImage, Category, StoredImage } from '@/types';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Timestamp } from 'firebase/firestore';

// Mock function for uploading images - replace with actual Firebase Storage upload
// For now, it will just return a placeholder URL based on the file name.
// This is a placeholder for the actual storage upload logic
const uploadImageToStorage = async (file: File): Promise<StoredImage> => {
  // In a real app, this would upload to Firebase Storage and return the URL and path
  console.log(`Simulating upload for: ${file.name}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return {
    id: crypto.randomUUID(),
    name: file.name,
    url: `https://placehold.co/400x300.png?text=${encodeURIComponent(file.name)}`, // Placeholder URL
    storagePath: `receipts/${file.name}` // Placeholder path
  };
};


const expenseFormSchema = z.object({
  images: z.array(z.custom<UploadedImage>()).min(0, "At least one image is recommended").max(5), // Validate array of UploadedImage
  companyAccount: z.boolean().default(false),
  type: z.enum(['debit', 'credit'], { required_error: "Transaction type is required" }),
  amount: z.coerce.number().positive({ message: "Amount must be positive" }),
  currency: z.string().min(1, "Currency is required"),
  date: z.date({ required_error: "Date is required" }),
  vendor: z.string().min(1, "Vendor is required").max(100),
  category: z.string().min(1, "Category is required"),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

export function ExpenseForm() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImagesData, setUploadedImagesData] = useState<UploadedImage[]>([]);

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      images: [],
      companyAccount: false,
      type: 'debit',
      amount: undefined,
      currency: 'USD',
      date: new Date(),
      vendor: '',
      category: '',
    },
  });

 useEffect(() => {
    form.setValue('date', new Date()); // Ensure date is initialized client-side
    if (currentUser?.uid) {
      getUserCategories(db, currentUser.uid).then(setCategories);
    }
  }, [currentUser?.uid, form]);

  const handleImagesChange = (newImages: UploadedImage[]) => {
    setUploadedImagesData(newImages);
    form.setValue('images', newImages, { shouldValidate: true });
  };

  const onSubmit = async (data: ExpenseFormData) => {
    if (!currentUser?.uid) {
      toast({ title: "Error", description: "You must be logged in to add an expense.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    try {
      const storedImages: StoredImage[] = [];
      for (const uploadedImage of uploadedImagesData) {
        if (uploadedImage.file) {
          const storedImage = await uploadImageToStorage(uploadedImage.file);
          storedImages.push(storedImage);
        }
      }
      
      await addExpenseToFirestore(db, currentUser.uid, {
        ...data,
        images: storedImages,
        date: Timestamp.fromDate(data.date), // Convert JS Date to Firestore Timestamp
      });
      toast({ title: "Success!", description: "Expense added successfully." });
      form.reset({ 
        images: [], 
        companyAccount: false, 
        type: 'debit', 
        currency: 'USD', 
        date: new Date(),
        vendor: '',
        category: '',
        // amount: undefined, // Let it be undefined so placeholder shows
      });
      setUploadedImagesData([]); // Clear image previews
    } catch (error) {
      console.error("Error adding expense:", error);
      toast({ title: "Error", description: "Failed to add expense. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!currentUser) return null;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-2xl">
          <PlusCircle className="h-7 w-7 text-primary" />
          Add New Expense
        </CardTitle>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="images">Receipt Image(s)</Label>
            <ImageUpload onImagesChange={handleImagesChange} />
            {form.formState.errors.images && <p className="text-sm text-destructive">{form.formState.errors.images.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" step="0.01" {...form.register('amount')} placeholder="e.g., 25.99" />
              {form.formState.errors.amount && <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Controller
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.currency && <p className="text-sm text-destructive">{form.formState.errors.currency.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type</Label>
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                    {TRANSACTION_TYPES.map(type => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={type.value} id={`type-${type.value}`} />
                        <Label htmlFor={`type-${type.value}`}>{type.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
              {form.formState.errors.type && <p className="text-sm text-destructive">{form.formState.errors.type.message}</p>}
            </div>
             <div className="flex items-center space-x-2 pt-5">
                <Controller
                    control={form.control}
                    name="companyAccount"
                    render={({ field }) => (
                        <Switch id="companyAccount" checked={field.value} onCheckedChange={field.onChange} />
                    )}
                />
                <Label htmlFor="companyAccount">Company Account</Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Controller
                control={form.control}
                name="date"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {form.formState.errors.date && <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Controller
                control={form.control}
                name="vendor"
                render={({ field }) => <VendorAutocomplete value={field.value} onChange={field.onChange} />}
              />
              {form.formState.errors.vendor && <p className="text-sm text-destructive">{form.formState.errors.vendor.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Controller
              control={form.control}
              name="category"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.category && <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto ml-auto bg-primary hover:bg-primary/90 text-primary-foreground">
            {isSubmitting ? (
              <Save className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Expense
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

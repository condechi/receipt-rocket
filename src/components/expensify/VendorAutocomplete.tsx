"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// For future use with ShadCN Command:
// import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from '@/components/ui/command';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// import { Check, ChevronsUpDown } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { cn } from '@/lib/utils';
// import type { Vendor } from '@/types';

interface VendorAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  // TODO: Add `vendors: Vendor[]` prop when implementing full autocomplete
}

// NOTE: Full autocomplete with ShadCN Command requires 'cmdk' package.
// This is a simplified version using a standard input field.
export function VendorAutocomplete({ value, onChange }: VendorAutocompleteProps) {
  // const [open, setOpen] = useState(false);
  // const [currentValue, setCurrentValue] = useState(value);

  // useEffect(() => {
  //   setCurrentValue(value);
  // }, [value]);

  // Dummy vendors - replace with actual data source
  // const vendors: Vendor[] = [
  //   { id: '1', name: 'Amazon' },
  //   { id: '2', name: 'Starbucks' },
  //   { id: '3', name: 'Shell Gas' },
  // ];

  // const handleSelect = (vendorName: string) => {
  //   setCurrentValue(vendorName);
  //   onChange(vendorName);
  //   setOpen(false);
  // };

  return (
    <Input
      type="text"
      placeholder="E.g., Amazon, Starbucks"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full"
    />
    // Example structure for future Command component:
    // <Popover open={open} onOpenChange={setOpen}>
    //   <PopoverTrigger asChild>
    //     <Button
    //       variant="outline"
    //       role="combobox"
    //       aria-expanded={open}
    //       className="w-full justify-between"
    //     >
    //       {currentValue || "Select vendor..."}
    //       <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    //     </Button>
    //   </PopoverTrigger>
    //   <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
    //     <Command>
    //       <CommandInput placeholder="Search vendor..." />
    //       <CommandEmpty>No vendor found.</CommandEmpty>
    //       <CommandList>
    //         {vendors.map((vendor) => (
    //           <CommandItem
    //             key={vendor.id}
    //             value={vendor.name}
    //             onSelect={() => handleSelect(vendor.name)}
    //           >
    //             <Check
    //               className={cn(
    //                 "mr-2 h-4 w-4",
    //                 currentValue === vendor.name ? "opacity-100" : "opacity-0"
    //               )}
    //             />
    //             {vendor.name}
    //           </CommandItem>
    //         ))}
    //       </CommandList>
    //     </Command>
    //   </PopoverContent>
    // </Popover>
  );
}

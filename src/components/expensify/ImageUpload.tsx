"use client";

import React, { useState, useCallback, ChangeEvent } from 'react';
import type { UploadedImage } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { X, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImagesChange: (images: UploadedImage[]) => void;
  maxFiles?: number;
  maxFileSizeMB?: number; // Max file size in MB
}

export function ImageUpload({
  onImagesChange,
  maxFiles = 5,
  maxFileSizeMB = 5,
}: ImageUploadProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const { toast } = useToast();

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: UploadedImage[] = [];
    const currentImageCount = uploadedImages.length;

    if (currentImageCount + files.length > maxFiles) {
      toast({
        title: "Upload Limit Exceeded",
        description: `You can upload a maximum of ${maxFiles} images.`,
        variant: "destructive",
      });
      event.target.value = ''; // Clear the input
      return;
    }
    
    Array.from(files).forEach(file => {
      if (file.size > maxFileSizeMB * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `File "${file.name}" exceeds the ${maxFileSizeMB}MB size limit.`,
          variant: "destructive",
        });
        return; // Skip this file
      }

      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: `File "${file.name}" is not a supported image type (JPEG, PNG, GIF, WebP).`,
          variant: "destructive",
        });
        return; // Skip this file
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push({
          id: crypto.randomUUID(),
          name: file.name,
          previewUrl: reader.result as string,
          file: file,
        });
        // Check if this is the last file being processed
        if (newImages.length === files.length - Array.from(files).filter(f => f.size > maxFileSizeMB * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(f.type)).length) {
           setUploadedImages(prev => {
            const updated = [...prev, ...newImages];
            onImagesChange(updated);
            return updated;
          });
        }
      };
      reader.readAsDataURL(file);
    });
    event.target.value = ''; // Clear the input after processing
  }, [uploadedImages, onImagesChange, maxFiles, maxFileSizeMB, toast]);

  const handleRemoveImage = useCallback((id: string) => {
    setUploadedImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      onImagesChange(updated);
      return updated;
    });
  }, [onImagesChange]);

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-input rounded-md p-6 text-center hover:border-primary transition-colors">
        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
        <label htmlFor="file-upload" className="mt-2 block text-sm font-medium text-primary cursor-pointer">
          <span>Upload receipt images</span>
          <Input 
            id="file-upload" 
            name="file-upload" 
            type="file" 
            className="sr-only" 
            multiple 
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange} 
            disabled={uploadedImages.length >= maxFiles}
          />
        </label>
        <p className="mt-1 text-xs text-muted-foreground">
          PNG, JPG, GIF, WEBP up to {maxFileSizeMB}MB each. Max {maxFiles} files.
        </p>
      </div>

      {uploadedImages.length > 0 && (
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <div className="flex w-max space-x-4 p-4">
            {uploadedImages.map(image => (
              <div key={image.id} className="relative group w-32 h-32 shrink-0">
                <Image
                  src={image.previewUrl}
                  alt={image.name}
                  width={128}
                  height={128}
                  className="rounded-md object-cover w-full h-full"
                  data-ai-hint="receipt document"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveImage(image.id)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove image</span>
                </Button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate rounded-b-md">
                  {image.name}
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </div>
  );
}

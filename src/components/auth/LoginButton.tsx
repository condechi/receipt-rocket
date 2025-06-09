"use client";

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export function LoginButton() {
  const { signIn, loading } = useAuth();

  return (
    <Button onClick={signIn} disabled={loading} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
      <LogIn className="mr-2 h-5 w-5" />
      Login with Google
    </Button>
  );
}

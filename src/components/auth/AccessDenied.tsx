"use client";

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, LogOut } from 'lucide-react';

export function AccessDenied() {
  const { signOut, currentUser } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="items-center text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <CardTitle className="text-3xl font-headline">Access Denied</CardTitle>
          <CardDescription className="text-lg">
            Sorry, {currentUser?.displayName || 'user'}, your account ({currentUser?.email}) is not authorized to access this application.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground text-center">
            If you believe this is an error, please contact the administrator.
          </p>
          <Button onClick={signOut} variant="outline" size="lg">
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

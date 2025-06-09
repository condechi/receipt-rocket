"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '../ui/button';

const LoginButton: React.FC = () => {
  const { signIn, loading } = useAuth();

  return (
    <Button onClick={signIn} disabled={loading}>
      {loading ? 'Loading...' : 'Sign in with Google'}
    </Button>
  );
};

export { LoginButton };
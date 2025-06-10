"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { auth, db, googleProvider } from '@/lib/firebase';
import { processFirebaseUser, signInWithGoogleRedirect, signOutUser } from '@/services/authService';
import type { FirebaseUser, UserProfile } from '@/types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  currentUser: UserProfile | null;
  role: 'user' | 'admin' | null;
  isAllowed: boolean;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<'user' | 'admin' | null>(null);
  const [isAllowed, setIsAllowed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Effect to handle initial auth state and redirect results
  useEffect(() => {
    const processUser = async (user: FirebaseUser | null) => {
      if (user) {
        const { userProfile, isUserAllowed, userRole } = await processFirebaseUser(user, db);
        setFirebaseUser(user);
        setCurrentUser(userProfile);
        setIsAllowed(isUserAllowed);
        setRole(userRole);
        console.log("AuthContext: processUser finished. State:", { firebaseUser: user?.uid, userProfile, isUserAllowed, userRole });
      } else {
        setFirebaseUser(null);
        setCurrentUser(null);
        setIsAllowed(false);
        setRole(null);
      }
      setLoading(false);
    };

    // Handle redirect result first
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          console.log("AuthContext: getRedirectResult found user:", result.user.uid);
          await processUser(result.user);
        } else {
          // If no redirect result, set up listener (handles direct page loads after login)
          const unsubscribe = onAuthStateChanged(auth, async (user) => {
            await processUser(user);
          });
          return () => unsubscribe();
        }
      })
      .catch(async (error) => {
        console.error("Auth redirect error:", error);
        // Still set up listener in case of error to handle current auth state
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          await processUser(user);
        });
        return () => unsubscribe();
      });
  // Empty dependency array ensures this runs once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogleRedirect(auth);
      // Redirect will occur, getRedirectResult will handle the rest
    } catch (error) {
      console.error("Error signing in:", error);
      setLoading(false);
    }
  };
  const signOut = async () => {
    setLoading(true);
    try {
      await signOutUser(auth);
      setFirebaseUser(null);
      setCurrentUser(null);
      setIsAllowed(false);
      setRole(null);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, currentUser, role, isAllowed, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

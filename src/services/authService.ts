import { Auth, signInWithRedirect, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp, Firestore } from 'firebase/firestore';
import type { UserProfile, AllowedUserEntry } from '@/types';
import { googleProvider } from '@/lib/firebase';

export const signInWithGoogleRedirect = async (auth: Auth): Promise<void> => {
  await signInWithRedirect(auth, googleProvider);
};


export const processFirebaseUser = async (
  firebaseUser: FirebaseUser,
  db: Firestore
): Promise<{ userProfile: UserProfile | null; isUserAllowed: boolean; userRole: 'user' | 'admin' | null }> => {
  if (!firebaseUser.email) {
    console.warn("Firebase user does not have an email address.");
    return { userProfile: null, isUserAllowed: false, userRole: null };
  }

  const allowedUserRef = doc(db, 'allowed_users', firebaseUser.email);
  const allowedUserSnap = await getDoc(allowedUserRef);

  let userRole: 'user' | 'admin' | null = null;
  let isUserAllowed = false;

  if (allowedUserSnap.exists()) {
    const allowedUserData = allowedUserSnap.data() as AllowedUserEntry;
    userRole = allowedUserData.role;
    isUserAllowed = true;
  } else {
    console.log(`User ${firebaseUser.email} not found in allowed_users.`);
  }
  
  // If user is allowed, create/update their profile in 'users' collection
  // Otherwise, we still might want to create a basic profile for denied users if the app needs to show their info.
  // For this app, only create/update if allowed.
  let userProfileData: UserProfile | null = null;

  if (isUserAllowed && userRole) {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    const profileUpdates: Partial<UserProfile> = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      role: userRole,
      lastLogin: serverTimestamp() as Timestamp,
    };

    if (!userSnap.exists()) {
      profileUpdates.createdAt = serverTimestamp() as Timestamp;
      await setDoc(userRef, profileUpdates);
    } else {
      await setDoc(userRef, profileUpdates, { merge: true });
    }
    
    // Fetch the potentially merged document to have consistent timestamps client-side
    const updatedUserSnap = await getDoc(userRef);
    userProfileData = updatedUserSnap.data() as UserProfile;

  } else if (firebaseUser) { // User authenticated but not allowed / no role
     userProfileData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role: null, // explicit null for role if not allowed or role missing
        lastLogin: serverTimestamp() as Timestamp, // track last attempt
        createdAt: serverTimestamp() as Timestamp, // track first attempt
     };
     // Optionally, could store these "denied" attempts in a different collection or log them.
     // For now, this profile is transient if not allowed.
  }


  return { userProfile: userProfileData, isUserAllowed, userRole };
};

export const signOutUser = async (auth: Auth): Promise<void> => {
  await signOut(auth);
};

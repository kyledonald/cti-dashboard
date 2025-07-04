import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  type User as FirebaseUser,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getIdToken,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { usersApi, type User, type CreateUserDTO } from '../api';

// Convert Firebase error codes to human-readable messages
const getHumanReadableError = (error: any): string => {
  if (!error?.code) return error?.message || 'An unexpected error occurred. Please try again.';
  
  const errorCode = error.code.replace('auth/', '');
  
  switch (errorCode) {
    case 'invalid-credential':
      return 'Invalid credentials! Please check your email and password and try again.';
    case 'user-not-found':
      return 'No account found with this email address. Please check your email or sign up.';
    case 'wrong-password':
      return 'Incorrect password. Please try again.';
    case 'email-already-in-use':
      return 'An account with this email already exists. Please sign in instead.';
    case 'weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'invalid-email':
      return 'Please enter a valid email address.';
    case 'user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'too-many-requests':
      return 'Too many failed attempts. Please wait a moment and try again.';
    case 'network-request-failed':
      return 'Network error. Please check your connection and try again.';
    case 'popup-closed-by-user':
      return 'Sign-in was cancelled. Please try again.';
    case 'popup-blocked':
      return 'Pop-up was blocked. Please allow pop-ups and try again.';
    case 'cancelled-popup-request':
      return 'Sign-in was cancelled. Please try again.';
    case 'internal-error':
      return 'Internal error occurred. Please try again later.';
    default:
      return error.message || 'An error occurred during authentication. Please try again.';
  }
};

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingUserData, setPendingUserData] = useState<{ firstName: string; lastName: string } | null>(null);

  // Create or update user in backend
  const createOrUpdateUser = async (firebaseUser: FirebaseUser, overrideNames?: { firstName: string; lastName: string }): Promise<User> => {
    try {
      // Get existing user by Firebase UID
      const existingUsers = await usersApi.getAll();
      
      // Ensure existingUsers is an array before calling find
      if (!Array.isArray(existingUsers)) {
        console.error('usersApi.getAll() did not return an array:', existingUsers);
        throw new Error('Invalid response format from users API');
      }
      
      const existingUser = existingUsers.find(u => u.googleId === firebaseUser.uid);
      
      if (existingUser) {
        // Update profile picture if it changed
        if (firebaseUser.photoURL && firebaseUser.photoURL !== existingUser.profilePictureUrl) {
          try {
            const updatedUser = await usersApi.update(existingUser.userId, {
              profilePictureUrl: firebaseUser.photoURL
            });
            return updatedUser;
          } catch (profileUpdateError) {
            console.error('Profile update failed, returning existing user:', profileUpdateError);
            return existingUser;
          }
        }
        
        return existingUser;
      } else {
        // Create new user
        let firstName: string;
        let lastName: string;
        
        if (overrideNames) {
          // Use the provided names (from email sign-up)
          firstName = overrideNames.firstName;
          lastName = overrideNames.lastName;
        } else {
          // Parse from displayName (for Google sign-in)
          const displayName = firebaseUser.displayName || '';
          const nameParts = displayName.trim().split(' ').filter(part => part.length > 0);
          firstName = nameParts[0] || firebaseUser.email!.split('@')[0] || 'User';
          lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        }
        
        const userData: CreateUserDTO = {
          googleId: firebaseUser.uid,
          email: firebaseUser.email!,
          firstName,
          lastName,
          ...(firebaseUser.photoURL && { profilePictureUrl: firebaseUser.photoURL }),
        };

        const newUser = await usersApi.create(userData);
        return newUser;
      }
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    if (firebaseUser) {
      try {
        const updatedUser = await createOrUpdateUser(firebaseUser);
        setUser(updatedUser);
      } catch (error) {
        console.error('Error refreshing user:', error);
      }
    }
  };

  useEffect(() => {
    // Prefetch critical endpoints to warm them up
    // const prefetchEndpoints = async () => {
    //   try {
    //     Promise.allSettled([
    //       fetch(`${import.meta.env.DEV ? '/api' : 'https://cti-dashboard-gateway-688kl12y.nw.gateway.dev'}/organizations`),
    //       fetch(`${import.meta.env.DEV ? '/api' : 'https://cti-dashboard-gateway-688kl12y.nw.gateway.dev'}/users`),
    //       fetch(`${import.meta.env.DEV ? '/api' : 'https://cti-dashboard-gateway-688kl12y.nw.gateway.dev'}/incidents`)
    //     ]);
    //     console.log('Prefetching endpoints to warm up backend...');
    //   } catch (error) {
    //     // Ignore prefetch errors
    //   }
    // };

    // prefetchEndpoints();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const user = await createOrUpdateUser(firebaseUser, pendingUserData || undefined);
          setUser(user);
          // Clear pending data after successful creation
          setPendingUserData(null);
        } catch (error) {
          console.error('Error handling user auth:', error);
          // Create temporary user to maintain auth flow
          let firstName: string;
          let lastName: string;
          
          if (pendingUserData) {
            firstName = pendingUserData.firstName;
            lastName = pendingUserData.lastName;
          } else {
            const displayName = firebaseUser.displayName || '';
            const nameParts = displayName.trim().split(' ').filter(part => part.length > 0);
            firstName = nameParts[0] || firebaseUser.email!.split('@')[0] || 'User';
            lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
          }
          
          const tempUser: User = {
            userId: firebaseUser.uid,
            googleId: firebaseUser.uid,
            email: firebaseUser.email!,
            firstName,
            lastName,
            ...(firebaseUser.photoURL && { profilePictureUrl: firebaseUser.photoURL }),
            role: 'unassigned',
            status: 'active',
            createdAt: { _seconds: Date.now() / 1000, _nanoseconds: 0 },
            updatedAt: { _seconds: Date.now() / 1000, _nanoseconds: 0 },
          };
          setUser(tempUser);
          console.log('Using temporary unassigned user due to backend error:', tempUser);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // User will be handled by onAuthStateChanged
    } catch (error) {
      console.error('Error signing in with Google:', error);
      const humanError = new Error(getHumanReadableError(error));
      throw humanError;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // User will be handled by onAuthStateChanged
    } catch (error) {
      console.error('Error signing in with email:', error);
      const humanError = new Error(getHumanReadableError(error));
      throw humanError;
    }
  };

  const signUpWithEmail = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      // Store the names for use in onAuthStateChanged
      setPendingUserData({ firstName, lastName });
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the Firebase user profile with display name
      await updateProfile(result.user, {
        displayName: `${firstName} ${lastName}`
      });
      
      // User creation in backend will be handled by onAuthStateChanged
    } catch (error) {
      console.error('Error signing up with email:', error);
      // Clear pending data on error
      setPendingUserData(null);
      const humanError = new Error(getHumanReadableError(error));
      throw humanError;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const getToken = async (): Promise<string | null> => {
    if (firebaseUser) {
      return await getIdToken(firebaseUser);
    }
    return null;
  };

  const value = {
    firebaseUser,
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    getToken,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
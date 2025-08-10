// Password complexity validation
const validatePasswordComplexity = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter.' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter.' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number.' };
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?).' };
  }
  
  return { isValid: true, message: '' };
};

interface UseLoginActionsProps {
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  isSignUp: boolean;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setShowEmailForm: (show: boolean) => void;
  setIsSignUp: (isSignUp: boolean) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (confirmPassword: string) => void;
  setFirstName: (firstName: string) => void;
  setLastName: (lastName: string) => void;
}

export const useLoginActions = ({
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  isSignUp,
  email,
  password,
  confirmPassword,
  firstName,
  lastName,
  setIsLoading,
  setError,
  setShowEmailForm,
  setIsSignUp,
  setEmail,
  setPassword,
  setConfirmPassword,
  setFirstName,
  setLastName,

}: UseLoginActionsProps) => {
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Google login failed:', error);
      setError(error.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Validation for signup
    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please try again.');
        setIsLoading(false);
        return;
      }
      
      // Password complexity validation
      const passwordValidation = validatePasswordComplexity(password);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.message);
        setIsLoading(false);
        return;
      }
    }
    
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, firstName, lastName);
        // Clear form after successful signup
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFirstName('');
        setLastName('');
        // Wait for auth state to update, then refresh
        await new Promise(resolve => setTimeout(resolve, 2000));
        window.location.reload();
      } else {
        await signInWithEmail(email, password);
      }
    } catch (error: any) {
      console.error('Email auth failed:', error);
      setError(error.message || `Failed to ${isSignUp ? 'sign up' : 'sign in'}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setConfirmPassword('');
    setError(null);
  };

  const handleBackToGoogle = () => {
    setShowEmailForm(false);
    setError(null);
  };

  return {
    handleGoogleSignIn,
    handleEmailAuth,
    handleToggleSignUp,
    handleBackToGoogle,
  };
}; 

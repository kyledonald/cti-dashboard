import { useState } from 'react';

export const useLoginState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  return {
    // Loading and error states
    isLoading,
    setIsLoading,
    error,
    setError,
    
    // Form visibility states
    isSignUp,
    setIsSignUp,
    showEmailForm,
    setShowEmailForm,
    
    // Form data
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    firstName,
    setFirstName,
    lastName,
    setLastName,
  };
}; 
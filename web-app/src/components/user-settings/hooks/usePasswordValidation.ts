export const usePasswordValidation = () => {
  const validatePasswordComplexity = (password: string): { isValid: boolean; message: string } => {
    if (!password || typeof password !== 'string') {
      return { isValid: false, message: 'Password is required.' };
    }
    
    // Check for whitespace-only password
    if (password.trim().length === 0) {
      return { isValid: false, message: 'Password cannot be empty or contain only whitespace.' };
    }
    
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long.' };
    }
    
    if (password.length > 128) {
      return { isValid: false, message: 'Password must be no more than 128 characters long.' };
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

  return {
    validatePasswordComplexity,
  };
}; 

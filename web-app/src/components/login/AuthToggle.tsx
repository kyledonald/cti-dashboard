import React from 'react';
import { Button } from '../ui/button';

interface AuthToggleProps {
  isSignUp: boolean;
  onToggle: () => void;
  onBackToGoogle: () => void;
}

export const AuthToggle: React.FC<AuthToggleProps> = ({
  isSignUp,
  onToggle,
  onBackToGoogle,
}) => {
  return (
    <>
      {/* Toggle Sign In/Sign Up */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
        </span>{' '}
        <button
          type="button"
          onClick={onToggle}
          className="text-primary hover:underline"
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </div>
      
      {/* Back to Google */}
      <Button
        onClick={onBackToGoogle}
        variant="ghost"
        className="w-full"
      >
        ← Back to Google Sign In
      </Button>
    </>
  );
}; 
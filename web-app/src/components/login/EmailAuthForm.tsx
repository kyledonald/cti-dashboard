import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { PasswordRequirements } from './PasswordRequirements';

interface EmailAuthFormProps {
  isSignUp: boolean;
  isLoading: boolean;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (confirmPassword: string) => void;
  onFirstNameChange: (firstName: string) => void;
  onLastNameChange: (lastName: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const EmailAuthForm: React.FC<EmailAuthFormProps> = ({
  isSignUp,
  isLoading,
  email,
  password,
  confirmPassword,
  firstName,
  lastName,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onFirstNameChange,
  onLastNameChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {isSignUp && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => onLastNameChange(e.target.value)}
              required
            />
          </div>
        </div>
      )}
      
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        required
      />
      
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        required
        minLength={isSignUp ? 8 : 6}
      />
      
      {isSignUp && (
        <Input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          required
          minLength={8}
        />
      )}
      
      {isSignUp && <PasswordRequirements password={password} />}
      
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
      </Button>
    </form>
  );
}; 
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { LoginPageHeader } from '../components/login/LoginPageHeader';
import { GoogleSignInButton } from '../components/login/GoogleSignInButton';
import { EmailAuthForm } from '../components/login/EmailAuthForm';
import { AuthToggle } from '../components/login/AuthToggle';
import { useLoginState } from '../components/login/hooks/useLoginState';
import { useLoginActions } from '../components/login/hooks/useLoginActions';

const LoginPage: React.FC = () => {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  
  // State management
  const {
    isLoading,
    setIsLoading,
    error,
    setError,
    isSignUp,
    setIsSignUp,
    showEmailForm,
    setShowEmailForm,
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
  } = useLoginState();

  // Actions
  const {
    handleGoogleSignIn,
    handleEmailAuth,
    handleToggleSignUp,
    handleBackToGoogle,
  } = useLoginActions({
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
  });

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <Card className="w-full max-w-md shadow-xl">
        <LoginPageHeader />
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}
          
          {!showEmailForm ? (
            <>
              <GoogleSignInButton
                isLoading={isLoading}
                onSignIn={handleGoogleSignIn}
              />
              
              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              
              {/* Email/Password Option */}
              <Button
                onClick={() => setShowEmailForm(true)}
                variant="outline"
                className="w-full"
              >
                Continue with Email
              </Button>
            </>
          ) : (
            <>
              <EmailAuthForm
                isSignUp={isSignUp}
                isLoading={isLoading}
                email={email}
                password={password}
                confirmPassword={confirmPassword}
                firstName={firstName}
                lastName={lastName}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onConfirmPasswordChange={setConfirmPassword}
                onFirstNameChange={setFirstName}
                onLastNameChange={setLastName}
                onSubmit={handleEmailAuth}
              />
              
              <AuthToggle
                isSignUp={isSignUp}
                onToggle={handleToggleSignUp}
                onBackToGoogle={handleBackToGoogle}
              />
            </>
          )}
          
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage; 

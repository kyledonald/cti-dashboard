import React from 'react';
import { CardDescription, CardHeader, CardTitle } from '../ui/card';

export const LoginPageHeader: React.FC = () => {
  return (
    <CardHeader className="text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
        <svg className="h-6 w-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
      <CardTitle className="text-2xl font-bold">CTI Dashboard</CardTitle>
      <CardDescription>
        Sign in to access your cyber threat intelligence dashboard
      </CardDescription>
    </CardHeader>
  );
}; 

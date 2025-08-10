import React from 'react';

interface PasswordRequirementsProps {
  password: string;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
}) => {
  return (
    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
      <p className="font-medium">Password requirements:</p>
      <ul className="space-y-1 ml-4">
        <li className={`${password.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}`}>
          • At least 8 characters
        </li>
        <li className={`${/[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}`}>
          • One uppercase letter
        </li>
        <li className={`${/[a-z]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}`}>
          • One lowercase letter
        </li>
        <li className={`${/[0-9]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}`}>
          • One number
        </li>
        <li className={`${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}`}>
          • One special character
        </li>
      </ul>
    </div>
  );
}; 

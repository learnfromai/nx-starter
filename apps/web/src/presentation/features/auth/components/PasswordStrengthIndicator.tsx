import React from 'react';
import { cn } from '../../../../lib/utils';
import type { PasswordStrength, PasswordRequirement } from '../types/RegistrationTypes';

interface PasswordStrengthIndicatorProps {
  password: string;
  strength: PasswordStrength;
  requirements: PasswordRequirement[];
  className?: string;
}

const strengthColors = {
  weak: 'bg-red-500',
  fair: 'bg-orange-500',
  good: 'bg-yellow-500',
  strong: 'bg-green-500',
};

const strengthLabels = {
  weak: 'Weak',
  fair: 'Fair',
  good: 'Good',
  strong: 'Strong',
};

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  strength,
  requirements,
  className,
}) => {
  if (!password) return null;

  return (
    <div className={cn('mt-2 space-y-2', className)}>
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <span className={cn(
            'font-medium',
            strength === 'weak' && 'text-red-600',
            strength === 'fair' && 'text-orange-600',
            strength === 'good' && 'text-yellow-600',
            strength === 'strong' && 'text-green-600',
          )}>
            {strengthLabels[strength]}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5">
          <div
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              strengthColors[strength]
            )}
            style={{
              width: `${
                strength === 'weak' ? 25 : 
                strength === 'fair' ? 50 : 
                strength === 'good' ? 75 : 100
              }%`
            }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Password must contain:</p>
        <ul className="space-y-1">
          {requirements.map((requirement, index) => (
            <li key={index} className="flex items-center text-xs">
              <div className={cn(
                'w-3 h-3 mr-2 rounded-full flex items-center justify-center',
                requirement.met 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-muted text-muted-foreground'
              )}>
                {requirement.met ? '✓' : '○'}
              </div>
              <span className={cn(
                requirement.met ? 'text-green-600' : 'text-muted-foreground'
              )}>
                {requirement.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
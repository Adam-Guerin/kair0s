/**
 * Kair0s Unified Button Component
 * 
 * Consistent button component with unified visual identity,
 * interaction patterns, and state management.
 */

import React, { forwardRef } from 'react';
import { cn } from '../utils/cn.js';
import { colors, spacing, borderRadius, shadows, animations, states, typography } from '../theme/index.js';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      // Base styles
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
      `font-${typography.fontWeight.medium}`,
      `text-${typography.fontSize.base}`,
      `leading-${typography.lineHeight.normal}`,
      
      // Size variations
      {
        xs: `px-2 py-1 text-xs ${spacing.xs} ${spacing.unit}`,
        sm: `px-3 py-1.5 text-sm ${spacing.sm} ${spacing.unit}`,
        md: `px-4 py-2 text-base ${spacing.sm} ${spacing.unit}`,
        lg: `px-6 py-3 text-lg ${spacing.md} ${spacing.unit}`,
        xl: `px-8 py-4 text-xl ${spacing.lg} ${spacing.unit}`,
      }[size],
      
      // Width
      fullWidth ? 'w-full' : '',
      
      // States
      loading ? states.loading : '',
      disabled || loading ? states.disabled : '',
      states.hover,
      states.focus,
      
      // Custom class
      className,
    ];

    const variantClasses = {
      primary: `
        bg-primary-500 text-white border border-primary-500
        hover:bg-primary-600 hover:border-primary-600
        focus:ring-primary-500
        shadow-sm
      `,
      secondary: `
        bg-background-secondary text-text-primary border border-border-light
        hover:bg-background-tertiary hover:border-border-medium
        focus:ring-primary-500
        shadow-sm
      `,
      outline: `
        bg-transparent text-primary-500 border border-primary-500
        hover:bg-primary-50 hover:border-primary-600
        focus:ring-primary-500
      `,
      ghost: `
        bg-transparent text-text-primary border-transparent
        hover:bg-background-secondary hover:text-text-primary
        focus:ring-primary-500
      `,
      danger: `
        bg-error-500 text-white border border-error-500
        hover:bg-error-600 hover:border-error-600
        focus:ring-error-500
        shadow-sm
      `,
    }[variant];

    const iconClasses = {
      left: icon ? 'mr-2' : '',
      right: icon ? 'ml-2' : '',
    }[iconPosition];

    const combinedClasses = cn(
      ...baseClasses,
      variantClasses,
      iconClasses[iconPosition],
      'focus:outline-none'
    );

    return (
      <button
        ref={ref}
        className={combinedClasses}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className={cn(
              'animate-spin -ml-1 mr-2 h-4 w-4',
              iconPosition === 'right' && 'ml-2 mr-0 -mr-1 ml-2'
            )}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0h12c2.627 0 4.727 1.373 4.727v8c0 2.627-2.099 4.727-4.727 4.727H4c-2.627 0-4.727-1.373-4.727-4.727V4z"
            />
          </svg>
        )}
        
        {iconPosition === 'left' && icon}
        
        <span className={loading ? 'opacity-50' : ''}>
          {children}
        </span>
        
        {iconPosition === 'right' && icon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };

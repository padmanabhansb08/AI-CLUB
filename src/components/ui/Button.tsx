import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
  loadingLabel?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', isLoading, loadingLabel = 'Loading…', className = '', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`btn btn-${variant} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="btn-spinner" aria-hidden="true" />
            <span>{loadingLabel}</span>
          </>
        ) : children}
      </button>
    );
  }
);

Button.displayName = 'Button';

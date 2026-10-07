import { forwardRef, useState, useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, type = 'text', className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const generatedId = useId();
    const inputId = props.id || generatedId;
    const isPassword = type === 'password';
    
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="form-group">
        {label && <label className="form-label" htmlFor={inputId}>{label}</label>}
        <div className="form-input-wrapper">
          <input
            ref={ref}
            type={inputType}
            className={`form-input ${error ? 'has-error' : ''} ${isPassword ? 'has-icon-right' : ''} ${className}`}
            {...props}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : props['aria-describedby']}
          />
          {isPassword && (
            <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}
              className="input-icon-right" 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {error && <div id={`${inputId}-error`} className="form-error" role="alert">{error}</div>}
      </div>
    );
  }
);

Input.displayName = 'Input';

import { forwardRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, type = 'text', className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="form-group">
        {label && <label className="form-label">{label}</label>}
        <div className="form-input-wrapper">
          <input
            ref={ref}
            type={inputType}
            className={`form-input ${error ? 'has-error' : ''} ${isPassword ? 'has-icon-right' : ''} ${className}`}
            {...props}
          />
          {isPassword && (
            <div 
              className="input-icon-right" 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </div>
          )}
        </div>
        {error && <div className="form-error">{error}</div>}
      </div>
    );
  }
);

Input.displayName = 'Input';

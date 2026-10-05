import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: (SelectOption | string)[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', id, required, ...props }, ref) => {
    return (
      <div className="form-group">
        {label && (
          <label htmlFor={id} className="form-label">
            {label} {required && <span style={{ color: 'var(--accent-color)' }}>*</span>}
          </label>
        )}
        <div className="form-input-wrapper select-wrapper">
          <select
            ref={ref}
            id={id}
            required={required}
            className={`form-input form-select ${error ? 'has-error' : ''} ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((opt) => {
              const val = typeof opt === 'string' ? opt : opt.value;
              const lbl = typeof opt === 'string' ? opt : opt.label;
              return (
                <option key={String(val)} value={val}>
                  {lbl}
                </option>
              );
            })}
          </select>
          <div className="select-icon-right" aria-hidden="true">
            <ChevronDown size={16} />
          </div>
        </div>
        {error && <div className="form-error">{error}</div>}
      </div>
    );
  }
);

Select.displayName = 'Select';

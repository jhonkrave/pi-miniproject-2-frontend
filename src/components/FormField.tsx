import React from 'react';

interface FormFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  min?: number;
  id?: string;
  autoComplete?: string;
  helperText?: string;
  icon?: string;
}

/**
 * Reusable form field component with consistent styling
 * @param props - FormField properties
 * @returns React component
 */
export default function FormField({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  min,
  id,
  autoComplete,
  helperText,
  icon,
}: FormFieldProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div style={{ position: 'relative' }}>
        {icon && <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>{icon}</span>}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          min={min}
          autoComplete={autoComplete}
          style={icon ? { paddingLeft: 40 } : {}}
        />
      </div>
      {helperText && <div className="muted">{helperText}</div>}
      {error && <div className="error" role="alert">⚠️ {error}</div>}
    </div>
  );
}

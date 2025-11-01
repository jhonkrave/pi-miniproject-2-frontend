import React from 'react';

/**
 * FormFieldProps interface for LumiFlix - mini project 2
 * 
 * This interface defines the properties for the FormField component.
 * 
 * @interface
 * @since 1.0.0
 */
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
 * FormField component for LumiFlix - mini project 2
 * 
 * This component is used to render a form field with a label, input, and error message.
 * 
 * @component
 * @returns {JSX.Element} The FormField component with the label, input, and error message
 * 
 * @example
 * ```tsx
 * import FormField from './components/FormField';
 * 
 * function App() {
 *   return <FormField label="Email" type="email" placeholder="Email" value="test@example.com" onChange={() => {}} />;
 * }
 * ```
 * 
 * @since 1.0.0
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

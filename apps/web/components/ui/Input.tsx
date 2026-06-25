import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className = '', ...props }: InputProps) {
  const input = <input {...props} className={`lex-input ${className}`.trim()} />;

  if (!label) {
    return input;
  }

  return (
    <label className="lex-label">
      {label}
      {input}
    </label>
  );
}

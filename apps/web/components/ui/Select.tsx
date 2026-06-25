import type { SelectHTMLAttributes } from 'react';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

export function Select({ label, className = '', children, ...props }: SelectProps) {
  const select = (
    <select {...props} className={`lex-input ${className}`.trim()}>
      {children}
    </select>
  );

  if (!label) {
    return select;
  }

  return (
    <label className="lex-label">
      {label}
      {select}
    </label>
  );
}

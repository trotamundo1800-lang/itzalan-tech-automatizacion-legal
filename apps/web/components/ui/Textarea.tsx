import type { TextareaHTMLAttributes } from 'react';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function Textarea({ label, className = '', ...props }: TextareaProps) {
  const textarea = <textarea {...props} className={`lex-input ${className}`.trim()} />;

  if (!label) {
    return textarea;
  }

  return (
    <label className="lex-label">
      {label}
      {textarea}
    </label>
  );
}

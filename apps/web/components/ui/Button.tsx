import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = PropsWithChildren<
  {
    variant?: ButtonVariant;
    full?: boolean;
  } & ButtonHTMLAttributes<HTMLButtonElement>
>;

export function Button({ children, variant = 'primary', full, className = '', ...props }: ButtonProps) {
  const variantClass =
    variant === 'primary'
      ? 'lex-button-primary'
      : variant === 'secondary'
        ? 'lex-button-secondary'
        : 'rounded-xl border border-slate-600 bg-transparent px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800/40';

  return (
    <button {...props} className={`${variantClass} ${full ? 'w-full' : ''} ${className}`.trim()}>
      {children}
    </button>
  );
}

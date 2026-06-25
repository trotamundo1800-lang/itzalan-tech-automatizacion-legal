import type { PropsWithChildren } from 'react';

type ModalProps = PropsWithChildren<{
  open: boolean;
  title?: string;
  onClose?: () => void;
}>;

export function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4">
      <section className="w-full max-w-xl rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          {title ? <h3 className="text-lg font-semibold text-slate-50">{title}</h3> : <span />}
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
            >
              Cerrar
            </button>
          ) : null}
        </div>
        {children}
      </section>
    </div>
  );
}

import { useEffect } from 'react';
import { X } from './icons';

// Class names for the two sections a modal form is made of.
export const bodyClass = 'space-y-4 px-6 py-5';
export const footClass = 'flex items-center justify-end gap-2 border-t border-line px-6 py-4';

export default function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-ink/45 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-[460px] rounded border border-line bg-sheet shadow-xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-3.5">
          <h2 className="text-base font-semibold">{title}</h2>
          <button aria-label="Close" onClick={onClose} className="-mr-2 grid size-10 cursor-pointer place-items-center rounded hover:bg-tint"><X /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

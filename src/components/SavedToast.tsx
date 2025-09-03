import { createPortal } from 'react-dom';

export default function SavedToast({ show }: { show: boolean }) {
  if (!show || typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
      <div className="rounded-lg px-3 py-2 text-sm text-white bg-emerald-600 shadow-xl">
        Saved
      </div>
    </div>,
    document.body,
  );
}

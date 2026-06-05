import { AlertTriangle } from 'lucide-react';
import Spinner from './Spinner';

// Controlled confirmation modal. Render once and toggle `open`.
export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl border border-dark-500 bg-dark-400 p-6 animate-fade-in">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-red-500">
          <AlertTriangle size={24} />
        </div>
        <h3 className="mt-4 text-lg font-bold text-white">{title}</h3>
        {message && <p className="mt-1.5 text-sm text-dark-700">{message}</p>}
        <div className="mt-6 flex gap-3">
          <button onClick={onCancel} className="btn-outline flex-1">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="btn-danger flex-1">
            {loading ? <Spinner size={16} className="text-[#fff]" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

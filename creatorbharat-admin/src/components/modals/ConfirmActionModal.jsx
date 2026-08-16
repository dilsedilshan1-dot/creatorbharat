// 🛡️ CreatorBharat SaaS Dangerous Action Confirmation Modal
import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

export function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Dangerous Action',
  targetName = 'this item',
  actionType = 'DELETE',
  consequence = 'This action will take effect immediately.',
  requireTypedConfirmation = false,
  confirmText = 'CONFIRM',
  isLoading = false
}) {
  const [inputVal, setInputVal] = useState('');
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const isTypedMatch = !requireTypedConfirmation || inputVal.trim().toUpperCase() === confirmText.toUpperCase();

  const handleConfirm = () => {
    if (!isTypedMatch) return;
    onConfirm({ reason: reason.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-sm text-slate-300">
          <p>
            Are you sure you want to perform <strong className="text-red-400 font-semibold">{actionType}</strong> on{' '}
            <strong className="text-white font-semibold">{targetName}</strong>?
          </p>
          <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-xl text-red-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{consequence}</span>
          </div>
        </div>

        {actionType === 'KYC_REJECT' && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Rejection Reason (Required for creator notification):</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Aadhaar details mismatched, blurred photo..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              rows={2}
            />
          </div>
        )}

        {requireTypedConfirmation && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">
              Type <span className="text-red-400 font-mono font-bold">{confirmText}</span> to proceed:
            </label>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={confirmText}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || !isTypedMatch}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-600/20 transition flex items-center gap-2"
          >
            {isLoading ? 'Processing...' : `Confirm ${actionType}`}
          </button>
        </div>
      </div>
    </div>
  );
}

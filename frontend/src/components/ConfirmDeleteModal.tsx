'use client';

import { FiAlertTriangle } from "react-icons/fi";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

export function ConfirmDeleteModal({ open, onClose, onConfirm, loading }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm border border-red-200 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <span className="flex items-center justify-center rounded-full bg-red-100 p-2">
            <FiAlertTriangle className="text-red-600 text-2xl" />
          </span>
          <h2 className="text-xl font-bold text-red-700">Excluir Vaga</h2>
        </div>
        <p className="mb-6 text-gray-700 text-base">
          Tem certeza que deseja <span className="font-semibold text-red-700">excluir</span> esta vaga? <br />
          <span className="text-sm text-gray-500">Esta ação não pode ser desfeita.</span>
        </p>
        <div className="flex justify-end gap-2 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded font-semibold bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            ) : null}
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
'use client';

import { FiAlertTriangle } from "react-icons/fi";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  entityLabel?: string; // ex: "candidato"
  entityName?: string;  // ex: "João Silva"
};

export function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  loading,
  entityLabel = "item",
  entityName,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm border border-red-200 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <span className="flex items-center justify-center rounded-full bg-red-100 p-2">
            <FiAlertTriangle className="text-red-600 text-2xl" />
          </span>
          <h2 className="text-xl font-bold text-red-700">Excluir {entityLabel.charAt(0).toUpperCase() + entityLabel.slice(1)}</h2>
        </div>
        <p className="mb-6 text-gray-700 text-base">
          Tem certeza que deseja excluir {entityLabel}
          {entityName ? <> <b>{entityName}</b>?</> : "?"}
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
            className="px-4 py-2 rounded font-semibold bg-red-600 text-white hover:bg-red-700 transition"
            disabled={loading}
          >
            {loading ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}
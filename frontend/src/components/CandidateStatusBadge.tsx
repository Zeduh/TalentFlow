import React from "react";

type Props = {
  status: string;
};

const statusMap: Record<string, { label: string; color: string }> = {
  applied: { label: "Inscrito", color: "bg-blue-100 text-blue-800" },
  screening: { label: "Triagem", color: "bg-yellow-100 text-yellow-800" },
  interview_scheduled: { label: "Entrevista", color: "bg-purple-100 text-purple-800" },
  offer: { label: "Oferta", color: "bg-green-100 text-green-800" },
  hired: { label: "Contratado", color: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Rejeitado", color: "bg-red-100 text-red-800" },
};

export function CandidateStatusBadge({ status }: Props) {
  const config = statusMap[status] || { label: status, color: "bg-gray-100 text-gray-800" };
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
}
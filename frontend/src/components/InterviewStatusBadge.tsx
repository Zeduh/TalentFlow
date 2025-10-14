import React from "react";

type Props = {
  status: "scheduled" | "completed" | "cancelled";
};

export function InterviewStatusBadge({ status }: Props) {
  const color =
    status === "scheduled"
      ? "bg-blue-100 text-blue-800"
      : status === "completed"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  const label =
    status === "scheduled"
      ? "Agendada"
      : status === "completed"
      ? "Concluída"
      : "Cancelada";
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>
      {label}
    </span>
  );
}
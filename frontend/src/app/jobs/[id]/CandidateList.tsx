'use client';

import { useState, useMemo } from "react";
import { useCandidates, Candidate } from "@/hooks/useCandidates";

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "applied", label: "Inscrito" },
  { value: "screening", label: "Triagem" },
  { value: "interview_scheduled", label: "Entrevista" },
  { value: "offer", label: "Oferta" },
  { value: "hired", label: "Contratado" },
  { value: "rejected", label: "Rejeitado" },
];

type Props = {
  jobId: string;
};

export function CandidateList({ jobId }: Props) {
  const [status, setStatus] = useState<string>("");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const limit = 10;

  const { data, isLoading, isError } = useCandidates({ jobId, status, cursor, limit });

  const candidates = useMemo(() => data?.data ?? [], [data]);

  return (
    <section className="mt-8 bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <h3 className="text-xl font-bold text-gray-900">Candidatos</h3>
        <div className="flex items-center gap-2">
          <label className="font-medium text-gray-700">Status:</label>
          <select
            value={status}
            onChange={e => {
              setStatus(e.target.value);
              setCursor(undefined);
            }}
            className="border rounded px-2 py-1 text-sm"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {isLoading ? (
        <div className="py-8 text-center text-blue-600">Carregando...</div>
      ) : isError ? (
        <div className="py-8 text-center text-red-500">Erro ao carregar candidatos.</div>
      ) : candidates.length === 0 ? (
        <div className="py-8 text-center text-gray-500">Nenhum candidato encontrado.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Nome</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c: Candidate) => (
                <tr key={c.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-2">{c.name}</td>
                  <td className="px-4 py-2">{c.email}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium
                      ${c.status === "applied" ? "bg-blue-100 text-blue-800"
                        : c.status === "screening" ? "bg-yellow-100 text-yellow-800"
                        : c.status === "interview_scheduled" ? "bg-purple-100 text-purple-800"
                        : c.status === "offer" ? "bg-green-100 text-green-800"
                        : c.status === "hired" ? "bg-green-200 text-green-900"
                        : c.status === "rejected" ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                      }`}>
                      {STATUS_OPTIONS.find(opt => opt.value === c.status)?.label ?? c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-end mt-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          onClick={() => setCursor(data?.nextCursor)}
          disabled={!data?.hasMore}
        >
          Carregar mais
        </button>
      </div>
    </section>
  );
}
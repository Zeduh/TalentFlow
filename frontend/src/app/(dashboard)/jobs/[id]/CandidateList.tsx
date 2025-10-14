"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useCandidates, Candidate } from "@/hooks/useCandidates";
import { CandidateFormModal } from "@/app/(dashboard)/candidates/CandidateFormModal";
import { CandidateStatusBadge } from "@/components/CandidateStatusBadge";

type Props = {
  jobId: string;
};

export function CandidateList({ jobId }: Props) {
  const LIMIT = 10;
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCandidate, setEditCandidate] = useState<Candidate | null>(null);

  const { data, isLoading, isError, isFetching } = useCandidates({
    jobId,
    limit: LIMIT,
    sequenceId: cursor,
  });

  // Reset lista ao trocar de vaga
  useEffect(() => {
    setCandidates([]);
    setCursor(undefined);
  }, [jobId]);

  // Atualiza lista de candidatos ao buscar nova página
  useEffect(() => {
    if (data?.data) {
      setCandidates((prev) =>
        cursor ? [...prev, ...data.data] : data.data
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, cursor, jobId]);

  if (isLoading && candidates.length === 0) return <div>Carregando candidatos...</div>;
  if (isError) return <div>Erro ao carregar candidatos.</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Candidatos</h3>
        <button
          className="w-full sm:w-auto px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={() => { setEditCandidate(null); setModalOpen(true); }}
        >
          + Novo Candidato
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="py-1 px-2 text-left text-xs font-semibold text-gray-700 sm:py-2 sm:px-3 sm:text-sm">Nome</th>
              <th className="py-1 px-2 text-left text-xs font-semibold text-gray-700 sm:py-2 sm:px-3 sm:text-sm">E-mail</th>
              <th className="py-1 px-2 text-left text-xs font-semibold text-gray-700 sm:py-2 sm:px-3 sm:text-sm">Status</th>
              <th className="py-1 px-2 sm:py-2 sm:px-3"></th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr key={candidate.id} className="border-b hover:bg-blue-50 transition">
                <td className="py-1 px-2 sm:py-2 sm:px-3">
                  <Link
                    href={`/candidates/${candidate.id}`}
                    className="text-blue-700 hover:underline font-medium"
                  >
                    {candidate.name}
                  </Link>
                </td>
                <td className="py-1 px-2 text-gray-800 sm:py-2 sm:px-3">{candidate.email}</td>
                <td className="py-1 px-2 sm:py-2 sm:px-3">
                  <CandidateStatusBadge status={candidate.status} />
                </td>
                <td className="py-1 px-2 sm:py-2 sm:px-3">
                  <button
                    className="text-xs sm:text-sm text-gray-600 hover:text-blue-700 font-semibold"
                    onClick={() => { setEditCandidate(candidate); setModalOpen(true); }}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Paginação cursor-based */}
        {data?.hasMore && (
          <div className="flex justify-center mt-4">
            <button
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded disabled:opacity-50"
              onClick={() => setCursor(data.nextCursor)}
              disabled={isFetching}
            >
              {isFetching ? "Carregando..." : "Carregar mais"}
            </button>
          </div>
        )}
      </div>
      <CandidateFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editCandidate || undefined}
        jobId={jobId}
      />
    </div>
  );
}
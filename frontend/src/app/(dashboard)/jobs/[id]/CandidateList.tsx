"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useCandidates, Candidate } from "@/hooks/useCandidates";
import { CandidateFormModal } from "@/app/(dashboard)/candidates/CandidateFormModal";
import { CandidateStatusBadge } from "@/components/CandidateStatusBadge";
import { Skeleton } from "@/components/Skeleton";

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

  if (isLoading && candidates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4 flex flex-col gap-2">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-40 mb-1" />
              <Skeleton className="h-6 w-20" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
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
      <div className="grid gap-4">
        {candidates.map((candidate) => (
          <div
            key={candidate.id}
            className="bg-gray-50 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          >
            <div>
              <Link
                href={`/candidates/${candidate.id}?from=jobs`}
                className="text-blue-700 hover:underline font-medium text-base"
              >
                {candidate.name}
              </Link>
              <div className="text-sm text-gray-800">{candidate.email}</div>
            </div>
            <div className="flex flex-col sm:items-end gap-2 min-w-[120px]">
              <CandidateStatusBadge status={candidate.status} />
              <button
                className="px-3 py-1 text-xs rounded bg-yellow-200 text-yellow-900 font-semibold hover:bg-yellow-300 transition"
                onClick={() => { setEditCandidate(candidate); setModalOpen(true); }}
              >
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>
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
      <CandidateFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editCandidate || undefined}
        jobId={jobId}
      />
    </div>
  );
}
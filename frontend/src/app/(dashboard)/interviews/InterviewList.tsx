"use client";
import { useInterviews } from "@/hooks/useInterviews";
import { InterviewStatusBadge } from "@/components/InterviewStatusBadge";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { InterviewFormModal } from "./InterviewFormModal";
import { useRouter } from "next/navigation"; // Adicione esta importação

type Props = {
  filters: {
    status?: string;
    candidateId?: string;
    date?: string;
  };
  isTablet?: boolean;
};

export function InterviewList({ filters }: Props) {
  const router = useRouter(); // Adicione este hook
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInterviews(filters);

  const [editInterview, setEditInterview] = useState<any | null>(null);
  const { user } = useAuth();

  // Função para navegar para a página do candidato
  const navigateToCandidate = (candidateId: string) => {
    router.push(`/candidates/${candidateId}?from=interviews`);
  };

  if (isLoading) return <div>Carregando entrevistas...</div>;
  if (isError) return <div>Erro ao carregar entrevistas.</div>;

  const interviews = data?.pages.flatMap((page) => page.data) ?? [];

  if (!interviews.length) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📅</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma entrevista encontrada</h3>
        <p className="text-gray-600">Tente ajustar os filtros para encontrar entrevistas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {interviews.map((interview) => (
        <div
          key={interview.id}
          className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-6 flex flex-col gap-2"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div 
                className="text-base font-semibold text-gray-900 mb-1 cursor-pointer hover:text-blue-700 hover:underline"
                onClick={() => navigateToCandidate(interview.candidateId)}
              >
                {interview.candidateName || interview.candidateId}
              </div>
              <div className="text-sm text-gray-700">
                <span className="font-medium">Vaga: </span>
                {interview.jobTitle || "-"}
              </div>
              {user?.role === "admin" && (
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Tenant: </span>
                  {interview.organizationName || interview.organizationId || "-"}
                </div>
              )}
              <div className="text-sm text-gray-700">
                <span className="font-medium">Data/Hora: </span>
                {new Date(interview.scheduledAt).toLocaleString()}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 min-w-[120px]">
              <InterviewStatusBadge status={interview.status} />
              <a
                href={interview.calendarLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline font-medium break-all text-xs"
              >
                Link do Calendário
              </a>
              <button
                className="px-3 py-1 text-xs rounded bg-yellow-200 text-yellow-900 font-semibold hover:bg-yellow-300 transition"
                onClick={() => setEditInterview(interview)}
              >
                Editar
              </button>
            </div>
          </div>
        </div>
      ))}

      {hasNextPage && (
        <div className="flex justify-center mt-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Carregando..." : "Carregar mais"}
          </button>
        </div>
      )}

      {/* Modal de edição */}
      {editInterview && (
        <InterviewFormModal
          open={!!editInterview}
          onClose={() => setEditInterview(null)}
          candidateId={editInterview.candidateId}
          initialData={editInterview}
          isEdit
        />
      )}
    </div>
  );
}
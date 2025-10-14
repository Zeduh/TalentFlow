"use client";
import { useInterviews } from "@/hooks/useInterviews";
import { InterviewStatusBadge } from "@/components/InterviewStatusBadge";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { InterviewFormModal } from "./InterviewFormModal";

type Props = {
  filters: {
    status?: string;
    candidateId?: string;
    date?: string;
  };
  isTablet?: boolean;
};

export function InterviewList({ filters, isTablet }: Props) {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInterviews(filters);

  const [editInterview, setEditInterview] = useState<any | null>(null);
  const { user } = useAuth();

  if (isLoading) return <div>Carregando entrevistas...</div>;
  if (isError) return <div>Erro ao carregar entrevistas.</div>;

  const interviews = data?.pages.flatMap((page) => page.data) ?? [];

  // Decide responsividade: se isTablet foi passado, usa ele; senão, usa Tailwind (retrocompatível)
  const showTable = isTablet === undefined ? undefined : !isTablet;
  const showCards = isTablet === undefined ? undefined : isTablet;

  return (
    <div>
      {/* Tabela para telas maiores que 790px */}
      {(showTable ?? true) && (
        <div className={`overflow-x-auto ${isTablet === undefined ? "hidden min-[791px]:block" : showTable ? "" : "hidden"}`}>
          <table className="min-w-[700px] w-full text-sm bg-white rounded-xl shadow border border-gray-200">
            <thead>
              <tr className="bg-blue-600">
                <th className="p-3 text-left text-white font-semibold">Candidato</th>
                <th className="p-3 text-left text-white font-semibold">Vaga</th>
                {user?.role === "admin" && (
                  <th className="p-3 text-left text-white font-semibold">Tenant</th>
                )}
                <th className="p-3 text-left text-white font-semibold">Data/Hora</th>
                <th className="p-3 text-left text-white font-semibold">Status</th>
                <th className="p-3 text-left text-white font-semibold">Calendário</th>
                <th className="p-3 text-left text-white font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map((interview) => (
                <tr
                  key={interview.id}
                  className="border-t hover:bg-blue-50 transition-colors"
                >
                  <td className="p-3 text-gray-900 font-medium">{interview.candidateName || interview.candidateId}</td>
                  <td className="p-3 text-gray-900">{interview.jobTitle || "-"}</td>
                  {user?.role === "admin" && (
                    <td className="p-3 text-gray-900">{interview.organizationName || interview.organizationId || "-"}</td>
                  )}
                  <td className="p-3 text-gray-900 whitespace-nowrap">{new Date(interview.scheduledAt).toLocaleString()}</td>
                  <td className="p-3">
                    <InterviewStatusBadge status={interview.status} />
                  </td>
                  <td className="p-3">
                    <a
                      href={interview.calendarLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 underline font-medium break-all"
                    >
                      Link
                    </a>
                  </td>
                  <td className="p-3">
                    <button
                      className="px-3 py-1 text-xs rounded bg-yellow-200 text-yellow-900 font-semibold hover:bg-yellow-300 transition"
                      onClick={() => setEditInterview(interview)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cards para telas até 790px */}
      {(showCards ?? true) && (
        <div className={`flex flex-col gap-4 ${isTablet === undefined ? "min-[791px]:hidden" : showCards ? "" : "hidden"}`}>
          {interviews.map((interview) => (
            <div
              key={interview.id}
              className="bg-white rounded-xl shadow border border-gray-200 p-4 flex flex-col gap-2"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-gray-900 text-base">{interview.candidateName || interview.candidateId}</span>
                <InterviewStatusBadge status={interview.status} />
              </div>
              <div className="text-gray-700 text-sm">
                <span className="font-medium">Vaga: </span>
                {interview.jobTitle || "-"}
              </div>
              {user?.role === "admin" && (
                <div className="text-gray-700 text-sm">
                  <span className="font-medium">Tenant: </span>
                  {interview.organizationName || interview.organizationId || "-"}
                </div>
              )}
              <div className="text-gray-700 text-sm">
                <span className="font-medium">Data/Hora: </span>
                {new Date(interview.scheduledAt).toLocaleString()}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <a
                  href={interview.calendarLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline font-medium break-all"
                >
                  Link
                </a>
                <button
                  className="px-3 py-1 text-xs rounded bg-yellow-200 text-yellow-900 font-semibold hover:bg-yellow-300 transition"
                  onClick={() => setEditInterview(interview)}
                >
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
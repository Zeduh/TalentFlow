"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCandidateDetail } from "@/hooks/useCandidateDetail";
import { useUpdateCandidate } from "@/hooks/useUpdateCandidate";
import { CandidateStatusBadge } from "@/components/CandidateStatusBadge";
import { CandidateTimeline } from "./CandidateTimeline";
import { InterviewFormModal } from "@/app/(dashboard)/interviews/InterviewFormModal";
import { InterviewStatusBadge } from "@/components/InterviewStatusBadge";
import toast from "react-hot-toast";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";

const STATUS_OPTIONS = [
  { value: "applied", label: "Inscrito" },
  { value: "screening", label: "Triagem" },
  { value: "interview_scheduled", label: "Entrevista" },
  { value: "offer", label: "Oferta" },
  { value: "hired", label: "Contratado" },
  { value: "rejected", label: "Rejeitado" },
];

type CandidateStatus = "applied" | "screening" | "interview_scheduled" | "offer" | "hired" | "rejected";

type Interview = {
  id: string;
  candidateId: string;
  candidateName?: string;
  scheduledAt: string;
  status: string;
  calendarLink: string;
};

type Props = {
  id: string;
};

export function CandidateDetail({ id }: Props) {
  const { data: candidate, isLoading } = useCandidateDetail(id);
  const { mutate: updateCandidate, isPending } = useUpdateCandidate();
  const [status, setStatus] = useState<string>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const [modalOpen, setModalOpen] = useState(false);
  const [editInterview, setEditInterview] = useState<Interview | null>(null);
  const queryClient = useQueryClient();

  // Função para atualizar dados do candidato após uma ação
  const refreshCandidateData = () => {
    queryClient.invalidateQueries({ queryKey: ["candidate-detail", id] });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-md p-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
        <div className="h-8 bg-gray-200 rounded mb-2 w-3/4"></div>
        <div className="h-5 bg-gray-200 rounded mb-8 w-1/2"></div>
        <div className="h-20 bg-gray-200 rounded mb-6"></div>
        <div className="h-10 bg-gray-200 rounded mb-6"></div>
        <div className="h-10 bg-gray-200 rounded mb-6 w-1/3"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-md p-8 text-center">
        <div className="text-5xl text-gray-300 mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Candidato não encontrado</h3>
        <p className="text-gray-600 mb-6">O candidato que você está procurando não existe ou foi removido.</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Voltar
        </button>
      </div>
    );
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    updateCandidate(
      { id: candidate.id, status: newStatus, jobId: candidate.jobId },
      {
        onSuccess: () => {
          toast.success("Status atualizado com sucesso!");
          refreshCandidateData();
        },
        onError: () => toast.error("Erro ao atualizar status do candidato."),
      }
    );
  };

  // Configurar o botão de voltar com base no parâmetro "from"
  const getBackNavigation = () => {
    if (from === "interviews") {
      return {
        url: "/interviews",
        label: "Entrevistas"
      };
    }
    
    return {
      url: `/jobs/${candidate.jobId}`,
      label: "Vaga"
    };
  };

  const backNav = getBackNavigation();
  const hasInterviews = candidate?.interviews && candidate.interviews.length > 0;

  // Função para lidar com o sucesso da operação no modal
  const handleInterviewSuccess = () => {
    refreshCandidateData();
    setModalOpen(false);
    setEditInterview(null);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Cabeçalho com navegação */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={backNav.url}
          className="flex items-center text-blue-700 hover:text-blue-800 transition-colors font-medium mb-4 sm:mb-0"
        >
          <span aria-hidden className="mr-1 text-lg">←</span> 
          Voltar para {backNav.label}
        </Link>
      </div>

      {/* Card Principal */}
      <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200">
        {/* Header com informações principais */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{candidate.name}</h2>
              <div className="text-gray-600 mb-2">{candidate.email}</div>
              {candidate.jobId && (
                <Link 
                  href={`/jobs/${candidate.jobId}`}
                  className="inline-flex items-center text-sm text-blue-700 hover:text-blue-800 hover:underline"
                >
                  <span className="mr-1">📋</span> Ver vaga
                </Link>
              )}
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <CandidateStatusBadge status={candidate.status} />
            </div>
          </div>
        </div>

        {/* Pipeline e Status */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4 text-lg">Pipeline do Candidato</h3>
          <div className="mb-6 overflow-x-auto">
            <CandidateTimeline status={candidate.status as CandidateStatus} />
          </div>
          
          <div className="mt-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">Alterar status:</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                value={status ?? candidate.status}
                onChange={handleStatusChange}
                disabled={isPending}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              
              {isPending && (
                <span className="inline-flex items-center text-sm text-gray-500">
                  <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Atualizando...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Seção de Entrevistas */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 text-lg">Entrevistas Agendadas</h3>
            <button
              className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium"
              onClick={() => setModalOpen(true)}
            >
              + Nova entrevista
            </button>
          </div>

          {!hasInterviews ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center border border-dashed border-gray-300">
              <div className="text-4xl text-gray-300 mb-2">📅</div>
              <h4 className="text-lg font-medium text-gray-800 mb-1">Sem entrevistas agendadas</h4>
              <p className="text-gray-600 mb-4">Agende uma entrevista para este candidato.</p>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                onClick={() => setModalOpen(true)}
              >
                Agendar entrevista
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm bg-white">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-3 text-left font-semibold border-b">Data/Hora</th>
                    <th className="p-3 text-left font-semibold border-b">Status</th>
                    <th className="p-3 text-left font-semibold border-b">Calendário</th>
                    <th className="p-3 text-left font-semibold border-b">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {candidate.interviews?.map((interview) => (
                    <tr key={interview.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="p-3 text-gray-900">
                        <div className="font-medium">
                          {new Date(interview.scheduledAt).toLocaleDateString()}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {new Date(interview.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </td>
                      <td className="p-3">
                        <InterviewStatusBadge status={interview.status} />
                      </td>
                      <td className="p-3">
                        <a
                          href={interview.calendarLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-700 hover:text-blue-800 hover:underline font-medium text-sm"
                        >
                          <span className="mr-1">🔗</span> Ver no calendário
                        </a>
                      </td>
                      <td className="p-3">
                        <button
                          className="px-3 py-1.5 text-xs rounded-md bg-amber-100 text-amber-800 font-medium hover:bg-amber-200 transition-colors"
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
        </div>
      </div>
      
      {/* Modal de agendamento */}
      <InterviewFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        candidateId={id}
        onSuccess={handleInterviewSuccess}
      />

      {/* Modal de edição */}
      {editInterview && (
        <InterviewFormModal
          open={!!editInterview}
          onClose={() => setEditInterview(null)}
          candidateId={id}
          initialData={editInterview}
          isEdit
          onSuccess={handleInterviewSuccess}
        />
      )}
    </div>
  );
}
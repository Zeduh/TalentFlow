"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCandidateDetail } from "@/hooks/useCandidateDetail";
import { useUpdateCandidate } from "@/hooks/useUpdateCandidate";
import { CandidateStatusBadge } from "@/components/CandidateStatusBadge";
import { CandidateTimeline } from "./CandidateTimeline";
import { InterviewFormModal } from "@/app/interviews/InterviewFormModal";
import { InterviewStatusBadge } from "@/components/InterviewStatusBadge";
import toast from "react-hot-toast";

const STATUS_OPTIONS = [
  { value: "applied", label: "Inscrito" },
  { value: "screening", label: "Triagem" },
  { value: "interview_scheduled", label: "Entrevista" },
  { value: "offer", label: "Oferta" },
  { value: "hired", label: "Contratado" },
  { value: "rejected", label: "Rejeitado" },
];

type Props = {
  id: string;
};

export function CandidateDetail({ id }: Props) {
  const { data: candidate, isLoading } = useCandidateDetail(id);
  const { mutate: updateCandidate, isPending } = useUpdateCandidate();
  const [status, setStatus] = useState<string>();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editInterview, setEditInterview] = useState<any | null>(null);


  if (isLoading) return <div>Carregando...</div>;
  if (!candidate) return <div>Candidato não encontrado.</div>;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    updateCandidate(
      { id: candidate.id, status: newStatus, jobId: candidate.jobId },
      {
        onSuccess: () => toast.success("Status atualizado!"),
        onError: () => toast.error("Erro ao atualizar status."),
      }
    );
  };

  return (
    <div className="bg-white rounded-xl p-8 shadow border border-gray-200 max-w-xl mx-auto">
      <button
        className="mb-4 text-blue-700 hover:underline flex items-center gap-1"
        onClick={() => router.push(`/jobs/${candidate.jobId}`)}
        aria-label="Voltar para lista de candidatos"
      >
        <span aria-hidden>←</span> Voltar para vaga
      </button>
      <h2 className="text-2xl font-bold mb-2 text-blue-800">{candidate.name}</h2>
      <p className="mb-2 text-gray-700">{candidate.email}</p>
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-2 text-center">Pipeline do Candidato</h3>
        <div className="flex justify-center">
          <CandidateTimeline status={candidate.status} />
        </div>
      </div>
      <label className="block mb-1 text-sm font-medium text-gray-800">Alterar status:</label>
      <select
        className="mb-4 w-full rounded border px-3 py-2 bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
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

      {/* Botão de agendar entrevista */}
      <button
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => setModalOpen(true)}
      >
        Agendar Entrevista
      </button>

      {candidate?.interviews && candidate.interviews.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 text-lg">Entrevistas Agendadas</h3>
          <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm bg-white">
              <thead className="bg-blue-600">
                <tr>
                  <th className="p-3 text-left text-white font-semibold">Data/Hora</th>
                  <th className="p-3 text-left text-white font-semibold">Status</th>
                  <th className="p-3 text-left text-white font-semibold">Calendário</th>
                  <th className="p-3 text-left text-white font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {candidate.interviews.map((interview) => (
                  <tr key={interview.id} className="border-t hover:bg-blue-50 transition">
                    <td className="p-3 text-gray-900">{new Date(interview.scheduledAt).toLocaleString()}</td>
                    <td className="p-3">
                      <InterviewStatusBadge status={interview.status} />
                    </td>
                    <td className="p-3">
                      <a
                        href={interview.calendarLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 underline font-medium"
                      >
                        Link
                      </a>
                    </td>
                    <td className="p-3">
                      <button
                        className="px-2 py-1 text-xs rounded bg-yellow-200 text-yellow-900 font-semibold hover:bg-yellow-300"
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
        </div>
      )}
      
      {/* Modal de agendamento */}
      <InterviewFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        candidateId={id}
      />

      {/* Modal de edição */}
      {editInterview && (
        <InterviewFormModal
          open={!!editInterview}
          onClose={() => setEditInterview(null)}
          candidateId={id}
          initialData={editInterview}
          isEdit
        />
      )}
    </div>
  );
}
"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useCreateCandidate } from "@/hooks/useCreateCandidate";
import { useUpdateCandidate } from "@/hooks/useUpdateCandidate";
import { useDeleteCandidate } from "@/hooks/useDeleteCandidate";
import { useAuth } from "@/hooks/useAuth";
import { Candidate } from "@/hooks/useCandidates";
import toast from "react-hot-toast";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";

type Props = {
  open: boolean;
  onClose: () => void;
  initialData?: Candidate;
  jobId: string;
};

type CandidateFormData = {
  name: string;
  email: string;
  status: string;
};

export function CandidateFormModal({ open, onClose, initialData, jobId }: Props) {
  const isEdit = !!initialData;
  const { mutate: createCandidate, isPending: creating } = useCreateCandidate();
  const { mutate: updateCandidate, isPending: updating } = useUpdateCandidate();
  const { mutate: deleteCandidate, isPending: deleting } = useDeleteCandidate();
  const { user } = useAuth();

  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CandidateFormData>({
    defaultValues: initialData || { name: "", email: "", status: "applied" },
  });

  // Reset form ao abrir/fechar
  React.useEffect(() => {
    if (open) {
      reset(initialData || { name: "", email: "", status: "applied" });
    }
  }, [open, initialData, reset]);

  const onSubmit = (data: CandidateFormData) => {
    if (isEdit) {
      updateCandidate(
        {
          id: initialData!.id,
          name: data.name,
          email: data.email,
          status: data.status
        },
        {
          onSuccess: () => {
            toast.success("Candidato atualizado!");
            onClose();
          },
          onError: (error: unknown) => {
            const status = error && typeof error === 'object' && 'response' in error 
              ? (error as { response?: { status?: number } }).response?.status 
              : null;
            
            if (status === 409) {
              toast.error("Este candidato já está inscrito nesta vaga.");
            } else {
              toast.error("Erro ao atualizar candidato.");
            }
          },
        }
      );
    } else {
      createCandidate(
        { name: data.name, email: data.email, status: data.status, jobId },
        {
          onSuccess: () => {
            toast.success("Candidato criado!");
            onClose();
          },
          onError: (error: unknown) => {
            const status = error && typeof error === 'object' && 'response' in error 
              ? (error as { response?: { status?: number } }).response?.status 
              : null;
            
            if (status === 409) {
              toast.error("Este candidato já está inscrito nesta vaga.");
            } else {
              toast.error("Erro ao criar candidato.");
            }
          },
        }
      );
    }
  };

  const handleDelete = () => {
    if (!initialData) return;
    deleteCandidate(
      { id: initialData.id, jobId },
      {
        onSuccess: () => {
          toast.success(`Candidato "${initialData.name}" excluído!`);
          setDeleteModalOpen(false);
          onClose();
        },
        onError: () => toast.error("Erro ao excluir candidato."),
      }
    );
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-0 overflow-y-auto">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-sm sm:max-w-md md:max-w-lg border border-gray-200 animate-fade-in"
        >
          <h2 className="text-2xl font-extrabold mb-6 text-blue-800 text-center tracking-tight">
            {isEdit ? "Editar Candidato" : "Novo Candidato"}
          </h2>
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-1 text-gray-800">Nome</label>
            <input
              {...register("name", { required: "Nome obrigatório" })}
              className="w-full rounded border px-3 py-2 bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Nome do candidato"
              disabled={creating || updating}
              autoFocus
            />
            {errors.name && <span className="text-red-600 text-xs">{errors.name.message}</span>}
          </div>
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-1 text-gray-800">E-mail</label>
            <input
              {...register("email", { required: "E-mail obrigatório" })}
              className="w-full rounded border px-3 py-2 bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="E-mail do candidato"
              disabled={creating || updating}
              type="email"
            />
            {errors.email && <span className="text-red-600 text-xs">{errors.email.message}</span>}
          </div>
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-1 text-gray-800">Status</label>
            <select
              {...register("status")}
              className="w-full rounded border px-3 py-2 bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={creating || updating}
            >
              <option value="applied">Inscrito</option>
              <option value="screening">Triagem</option>
              <option value="interview_scheduled">Entrevista</option>
              <option value="offer">Oferta</option>
              <option value="hired">Contratado</option>
              <option value="rejected">Rejeitado</option>
            </select>
          </div>
          <div className="flex justify-between items-center mt-8 gap-2">
            <div>
              {isEdit && user?.role === "admin" && (
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 rounded font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                  disabled={creating || updating || deleting}
                >
                  Excluir
                </button>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 rounded font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={creating || updating || deleting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 rounded font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={creating || updating || deleting}
              >
                {isEdit ? "Salvar" : "Criar"}
              </button>
            </div>
          </div>
        </form>
      </div>
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        entityLabel="candidato"
        entityName={initialData?.name}
      />
    </>
  );
}
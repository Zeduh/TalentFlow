"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useCreateInterview } from "@/hooks/useCreateInterview";
import { useUpdateInterview } from "@/hooks/useUpdateInterview";
import { useDeleteInterview } from "@/hooks/useDeleteInterview";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";

type InterviewData = {
  id: string;
  candidateId: string;
  candidateName?: string;
  scheduledAt: string;
  status: string;
};

type FormData = {
  scheduledAt: string;
  status: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  candidateId: string;
  initialData?: InterviewData;
  isEdit?: boolean;
  onSuccess?: () => void;
};

export function InterviewFormModal({ 
  open, 
  onClose, 
  candidateId, 
  initialData, 
  isEdit,
  onSuccess 
}: Props) {
  const { register, handleSubmit, reset, setValue } = useForm<FormData>({
    defaultValues: {
      scheduledAt: initialData?.scheduledAt
        ? new Date(initialData.scheduledAt).toISOString().slice(0, 16)
        : "",
      status: initialData?.status || "scheduled",
    },
  });
  const createInterview = useCreateInterview();
  const updateInterview = useUpdateInterview(); 
  const deleteInterview = useDeleteInterview();
  const { user } = useAuth();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);

  React.useEffect(() => {
    if (initialData) {
      setValue("scheduledAt", new Date(initialData.scheduledAt).toISOString().slice(0, 16));
      setValue("status", initialData.status);
    }
  }, [initialData, setValue]);

  const onSubmit = (data: FormData) => {
    if (isEdit && initialData?.id) {
      // Implementar funcionalidade de edição
      updateInterview.mutate(
        {
          id: initialData.id,
          scheduledAt: data.scheduledAt,
          status: data.status,
          candidateId,
        },
        {
          onSuccess: () => {
            toast.success("Entrevista atualizada!");
            reset();
            onClose();
            // Chamar onSuccess para atualizar os dados do candidato
            if (onSuccess) onSuccess();
          },
          onError: (err: unknown) => {
            const errorMessage = err instanceof Error && 'response' in err 
              ? (err as { response?: { data?: { message?: string } } }).response?.data?.message 
              : "Erro ao atualizar entrevista.";
            toast.error(errorMessage || "Erro ao atualizar entrevista.");
          },
        }
      );
    } else {
      createInterview.mutate(
        {
          candidateId,
          scheduledAt: data.scheduledAt,
          status: data.status as "scheduled" | "completed" | "cancelled",
        },
        {
          onSuccess: () => {
            toast.success("Entrevista agendada!");
            reset();
            onClose();
            // Chamar onSuccess para atualizar os dados do candidato
            if (onSuccess) onSuccess();
          },
          onError: (err: unknown) => {
            const errorMessage = err instanceof Error && 'response' in err 
              ? (err as { response?: { data?: { message?: string } } }).response?.data?.message 
              : "Erro ao agendar entrevista.";
            toast.error(errorMessage || "Erro ao agendar entrevista.");
          },
        }
      );
    }
  };

  const handleDelete = () => {
    if (!initialData?.id) return;
    deleteInterview.mutate(
      { 
        id: initialData.id, 
        candidateId 
      },
      {
        onSuccess: () => {
          toast.success("Entrevista excluída!");
          setConfirmDeleteOpen(false);
          onClose();
          // Chamar onSuccess para atualizar os dados do candidato
          if (onSuccess) onSuccess();
        },
        onError: (err: unknown) => {
          const errorMessage = err instanceof Error && 'response' in err 
            ? (err as { response?: { data?: { message?: string } } }).response?.data?.message 
            : "Erro ao excluir entrevista.";
          toast.error(errorMessage || "Erro ao excluir entrevista.");
          setConfirmDeleteOpen(false);
        },
      }
    );
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-200">
          <h2 className="text-2xl font-bold mb-6 text-blue-800 text-center">
            {isEdit ? "Editar Entrevista" : "Agendar Entrevista"}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block mb-1 font-semibold text-gray-700">Data/Hora</label>
              <input
                type="datetime-local"
                {...register("scheduledAt", { required: true })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-900"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700">Status</label>
              <select
                {...register("status", { required: true })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-900"
              >
                <option value="scheduled">Agendada</option>
                <option value="completed">Concluída</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
              >
                Cancelar
              </button>
              {isEdit && user?.role === "admin" && (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteOpen(true)}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                  disabled={deleteInterview.isPending}
                >
                  Excluir
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                disabled={createInterview.isPending || updateInterview.isPending}
              >
                {isEdit ? "Salvar" : "Agendar"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ConfirmDeleteModal
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleteInterview.isPending}
        entityLabel="entrevista"
        entityName={initialData?.candidateName}
      />
    </>
  );
}
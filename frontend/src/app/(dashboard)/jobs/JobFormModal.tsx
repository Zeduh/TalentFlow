'use client';

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateJob } from "@/hooks/useCreateJob";
import { useUpdateJob } from "@/hooks/useUpdateJob";
import { useTenants } from "@/hooks/useTenants";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast"; // <-- adicione esta linha

type JobFormValues = {
  title: string;
  status: "open" | "closed" | "paused";
  organizationId?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  initialData?: JobFormValues;
  jobId?: string;
};

export function JobFormModal({ open, onClose, initialData, jobId }: Props) {
  const { user } = useAuth();
  const isEdit = !!initialData && !!jobId;
  const { data: tenants } = useTenants();
  const { mutate: createJob, isPending: creating } = useCreateJob();
  const { mutate: updateJob, isPending: updating } = useUpdateJob();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<JobFormValues>({
    defaultValues: initialData
        ? {
            title: initialData.title,
            status: initialData.status,
            organizationId: initialData.organizationId,
        }
        : { title: "", status: "open", organizationId: user?.organizationId }
  });

  useEffect(() => {
    if (open) {
      reset(initialData || { title: "", status: "open", organizationId: user?.organizationId });
    }
  }, [open, initialData, reset, user?.organizationId]);

  const onSubmit = (data: JobFormValues) => {
    if (isEdit && jobId) {
      const { title, status, organizationId } = data;
      const payload =
        user?.role === "admin"
          ? { id: jobId, title, status, organizationId }
          : { id: jobId, title, status };
      updateJob(payload, {
        onSuccess: () => {
          toast.success("Vaga atualizada com sucesso!");
          queryClient.invalidateQueries({ queryKey: ["job-detail", jobId] });
          onClose();
        },
        onError: () => {
          toast.error("Erro ao atualizar vaga.");
        },
      });
    } else {
      createJob(data, {
        onSuccess: () => {
          toast.success("Vaga criada com sucesso!");
          onClose();
        },
        onError: () => {
          toast.error("Erro ao criar vaga.");
        },
      });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200 animate-fade-in"
      >
        <h2 className="text-2xl font-extrabold mb-6 text-blue-800 text-center tracking-tight">
          {isEdit ? "Editar Vaga" : "Nova Vaga"}
        </h2>
        <div className="mb-5">
          <label className="block text-sm font-semibold mb-1 text-gray-800">Título</label>
          <input
            {...register("title", { required: "Título obrigatório" })}
            className="w-full rounded border px-3 py-2 bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Título da vaga"
            disabled={creating || updating}
            autoFocus
          />
          {errors.title && <span className="text-red-600 text-xs">{errors.title.message}</span>}
        </div>
        <div className="mb-5">
          <label className="block text-sm font-semibold mb-1 text-gray-800">Status</label>
          <select
            {...register("status", { required: true })}
            className="w-full rounded border px-3 py-2 bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            disabled={creating || updating}
          >
            <option value="open">Aberta</option>
            <option value="closed">Fechada</option>
            <option value="paused">Pausada</option>
          </select>
        </div>
        {user?.role === "admin" && (
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-1 text-gray-800">Organização</label>
            <select
              {...register("organizationId", { required: "Obrigatório" })}
              className="w-full rounded border px-3 py-2 bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={creating || updating}
            >
              <option value="">Selecione...</option>
              {tenants?.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {errors.organizationId && <span className="text-red-600 text-xs">{errors.organizationId.message}</span>}
          </div>
        )}
        <div className="flex justify-end gap-2 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={creating || updating}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 rounded font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={creating || updating}
          >
            {isEdit ? "Salvar" : "Criar"}
          </button>
        </div>
      </form>
    </div>
  );
}
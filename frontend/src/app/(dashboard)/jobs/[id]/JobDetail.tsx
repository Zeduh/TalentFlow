'use client';

import { useJobDetail } from "@/hooks/useJobDetail";
import { useTenants } from "@/hooks/useTenants";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { JobFormModal } from "../JobFormModal";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { useDeleteJob } from "@/hooks/useDeleteJob";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";


type Props = {
  jobId: string;
};

export function JobDetail({ jobId }: Props) {
  const { data: job, isLoading, isError } = useJobDetail(jobId);
  const { data: tenants } = useTenants();
  const { user } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false); // <-- Adicionado
  const { mutate: deleteJob, isPending } = useDeleteJob(); // <-- Adicionado
  const router = useRouter(); // <-- Adicionado

  // Busca o nome da organização pelo organizationId da vaga
  const organizationName =
    tenants?.find((t) => t.id === job?.organizationId)?.name || job?.organizationId;

  if (isLoading) {
    return <div className="py-8 text-center text-blue-600">Carregando detalhes da vaga...</div>;
  }
  if (isError || !job) {
    return <div className="py-8 text-center text-red-500">Erro ao carregar detalhes da vaga.</div>;
  }

  // Permite edição apenas para admin ou recruiter da mesma organização
  const canEdit =
    user &&
    (user.role === "admin" ||
      (user.role === "recruiter" && user.organizationId === job.organizationId));
  const canDelete = user?.role === "admin";

  return (
    <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8 flex flex-col gap-2 relative">
      <h2 className="text-2xl font-bold mb-2 text-gray-900">{job.title}</h2>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-gray-700">
        <div>
          <span className="font-semibold">Status:</span>{" "}
          <span
            className={`inline-block px-2 py-1 rounded text-xs font-medium
            ${
              job.status === "open"
                ? "bg-green-100 text-green-800"
                : job.status === "closed"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }
          `}
          >
            {job.status === "open"
              ? "Aberta"
              : job.status === "closed"
              ? "Fechada"
              : "Pausada"}
          </span>
        </div>
        <div>
          <span className="font-semibold">Organização:</span>{" "}
          <span>{organizationName}</span> 
        </div>
        <div>
          <span className="font-semibold">Criada em:</span>{" "}
          <span>{new Date(job.createdAt).toLocaleDateString("pt-BR")}</span>
        </div>
      </div>
      {canEdit && (
        <button
          onClick={() => setEditOpen(true)}
          className="absolute top-6 right-6 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md border border-yellow-300 hover:bg-yellow-200 transition-colors text-sm font-medium"
        >
          Editar
        </button>
      )}
      <JobFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialData={{
          title: job.title,
          status: job.status,
          organizationId: job.organizationId,
        }}
        jobId={job.id}
      />
      {canDelete && (
        <button
          onClick={() => setDeleteOpen(true)}
          className="absolute top-6 right-32 px-4 py-2 bg-red-100 text-red-800 rounded-md border border-red-300 hover:bg-red-200 transition-colors text-sm font-medium"
        >
          Excluir
        </button>
      )}
      <ConfirmDeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() =>
          deleteJob(job.id, {
            onSuccess: () => {
              toast.success(`Vaga "${job.title}" excluída com sucesso!`);
              setDeleteOpen(false);
              router.push("/jobs");
            },
            onError: () => {
              toast.error("Erro ao excluir vaga.");
            },
          })
        }
        loading={isPending}
        entityLabel="vaga"
        entityName={job.title}
      />
    </section>
  );
}
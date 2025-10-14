import Link from "next/link";
import { Job } from "@/hooks/useJobs";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { JobFormModal } from "./JobFormModal";
import { useDeleteJob } from "@/hooks/useDeleteJob";

type Props = {
  job: Job;
};

export function JobCard({ job }: Props) {
  const { user } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { mutate: deleteJob, isPending } = useDeleteJob();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "open":
        return { label: "Aberta", bg: "bg-green-100", text: "text-green-900", border: "border-green-200" };
      case "closed":
        return { label: "Fechada", bg: "bg-red-100", text: "text-red-900", border: "border-red-200" };
      case "paused":
        return { label: "Pausada", bg: "bg-yellow-100", text: "text-yellow-900", border: "border-yellow-200" };
      default:
        return { label: status, bg: "bg-gray-100", text: "text-gray-900", border: "border-gray-200" };
    }
  };

  const statusConfig = getStatusConfig(job.status);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {job.title}
          </h3>
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
            >
              {statusConfig.label}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(job.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <Link
          href={`/jobs/${job.id}`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Ver detalhes
        </Link>
      </div>
    </div>
  );
}
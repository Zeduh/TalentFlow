'use client';

import { useState, useMemo } from "react";
import { useJobsInfinite } from "@/hooks/useJobs";
import { JobList } from "./JobList";
import { JobFilters } from "./JobFilters";
import { useAuth } from "@/hooks/useAuth";
import { TenantFilter } from "@/components/TenantFilter";
import { JobFormModal } from "./JobFormModal";
import { PageTitle } from "@/components/PageTitle";

export default function JobsPage() {
  const [status, setStatus] = useState<string>("");
  const [tenant, setTenant] = useState<string | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();

  const params = useMemo(() => {
    const baseParams: { status: string; limit: number; organizationId?: string } = { 
      status, 
      limit: 10 
    };
    if (user?.role === "admin" && tenant) {
      baseParams.organizationId = tenant;
    }
    return baseParams;
  }, [status, tenant, user?.role]);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useJobsInfinite(params);

  // Agrupa todos os jobs de todas as páginas
  const allJobs = useMemo(() => {
    return data?.pages.flatMap(page => page.data) ?? [];
  }, [data]);

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <PageTitle>Vagas Disponíveis</PageTitle>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
              {user?.role === "admin" && (
                <TenantFilter
                  tenant={tenant}
                  onTenantChange={setTenant}
                />
              )}
              <JobFilters
                status={status}
                onStatusChange={setStatus}
              />
            </div>
            
            {/* Botão para abrir o modal */}
            <div className="flex gap-2">
              {(user?.role === "admin" || user?.role === "recruiter") && (
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                  onClick={() => setModalOpen(true)}
                >
                  + Nova Vaga
                </button>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center px-4 py-2 text-lg text-blue-600">
              <div className="animate-spin -ml-1 mr-3 h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              Carregando vagas...
            </div>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar vagas</h3>
            <p className="text-gray-600">Tente recarregar a página.</p>
          </div>
        ) : (
          <JobList
            jobs={allJobs}
            hasNextPage={hasNextPage ?? false}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
          />
        )}

        {/* Modal de criação de vaga */}
        <JobFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    </main>
  );
}
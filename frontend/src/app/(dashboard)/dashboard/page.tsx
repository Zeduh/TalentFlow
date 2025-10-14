"use client";

import { useEffect } from "react";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { useAuth } from "@/hooks/useAuth";

// Mapeamento de status para label e cor
const statusMap: Record<string, { label: string; color: string; border: string }> = {
  applied: { label: "Aplicado", color: "bg-gray-100 text-gray-800", border: "border-gray-300" },
  screening: { label: "Triagem", color: "bg-blue-100 text-blue-800", border: "border-blue-300" },
  interview_scheduled: { label: "Entrevista Agendada", color: "bg-yellow-100 text-yellow-800", border: "border-yellow-300" },
  offer: { label: "Oferta", color: "bg-green-100 text-green-800", border: "border-green-300" },
  hired: { label: "Contratado", color: "bg-green-200 text-green-900", border: "border-green-400" },
  rejected: { label: "Rejeitado", color: "bg-red-100 text-red-800", border: "border-red-300" },
};

function Skeleton() {
  return <div className="animate-pulse h-8 w-16 bg-gray-200 rounded" />;
}

function MetricCard({
  title,
  value,
  color,
}: {
  title: string;
  value: React.ReactNode;
  color: string;
}) {
  return (
    <div
      className={`rounded-xl shadow-md p-6 ${color} flex flex-col items-center justify-center min-h-[120px] transition hover:scale-[1.02]`}
    >
      <div className="text-base font-medium mb-2 text-center">{title}</div>
      <div className="text-3xl font-bold text-center">{value}</div>
    </div>
  );
}

// Componente para lista de status dos candidatos
function CandidateStatusList({ candidates, isLoading }: { candidates: Record<string, number>; isLoading: boolean }) {
  if (isLoading) return <Skeleton />;
  return (
    <ul className="space-y-2 w-full">
      {Object.entries(candidates).map(([status, count]) => {
        const map = statusMap[status] || { label: status, color: "bg-gray-50 text-gray-800", border: "border-gray-200" };
        return (
          <li key={status} className="flex items-center justify-between">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${map.color} ${map.border} shadow-sm`}
            >
              {map.label}
            </span>
            <span className="font-bold text-base text-gray-700">{count}</span>
          </li>
        );
      })}
    </ul>
  );
}

// Componente principal do dashboard
export default function DashboardPage() {
  const { data, isLoading, error } = useDashboardMetrics();
  const { user } = useAuth();

  useEffect(() => {
    if (error) {
      // toast.error("Erro ao carregar métricas do dashboard");
    }
  }, [error]);

  // Exemplo de métricas extras para admin
  const tenantsCount = user?.role === "admin" ? 2 : undefined; // mock, troque por dado real
  const usersCount = user?.role === "admin" ? 10 : undefined; // mock, troque por dado real

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-2 sm:px-4">
      <div className="max-w-5xl mx-auto w-full">
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <MetricCard
            title="Vagas Abertas"
            value={isLoading ? <Skeleton /> : data?.jobs.open ?? 0}
            color="bg-green-100 text-green-800"
          />
          <MetricCard
            title="Vagas Fechadas"
            value={isLoading ? <Skeleton /> : data?.jobs.closed ?? 0}
            color="bg-red-100 text-red-800"
          />
          {user?.role === "admin" && (
            <MetricCard
              title="Vagas Pausadas"
              value={isLoading ? <Skeleton /> : data?.jobs.paused ?? 0}
              color="bg-yellow-100 text-yellow-800"
            />
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {(user?.role === "admin" || user?.role === "recruiter") && (
            <MetricCard
              title="Candidatos por Status"
              value={
                data ? (
                  <CandidateStatusList candidates={data.candidates} isLoading={isLoading} />
                ) : (
                  <Skeleton />
                )
              }
              color="bg-blue-100 text-blue-800"
            />
          )}
          <MetricCard
            title="Entrevistas"
            value={
              isLoading ? (
                <Skeleton />
              ) : (
                <div className="flex flex-col gap-1 items-center">
                  <div>
                    <span className="font-semibold">{data?.interviews.today ?? 0}</span> hoje
                  </div>
                  <div>
                    <span className="font-semibold">{data?.interviews.week ?? 0}</span> na semana
                  </div>
                </div>
              )
            }
            color="bg-purple-100 text-purple-800"
          />
          {user?.role === "admin" && (
            <>
              <MetricCard
                title="Organizações"
                value={tenantsCount ?? <Skeleton />}
                color="bg-gray-100 text-gray-800"
              />
              <MetricCard
                title="Usuários"
                value={usersCount ?? <Skeleton />}
                color="bg-gray-100 text-gray-800"
              />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
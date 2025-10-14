import { useEffect, useRef } from "react";
import { JobCard } from "./JobCard";
import { Job } from "@/hooks/useJobs";

type Props = {
  jobs: Job[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
};

export function JobList({ jobs, hasNextPage, isFetchingNextPage, fetchNextPage }: Props) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!jobs.length) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📋</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma vaga encontrada</h3>
        <p className="text-gray-600">Tente ajustar os filtros para encontrar vagas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
      
      {/* Trigger para infinite scroll */}
      <div ref={loadMoreRef} className="py-4">
        {isFetchingNextPage && (
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 text-sm text-blue-600">
              <div className="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              Carregando mais vagas...
            </div>
          </div>
        )}
        {!hasNextPage && jobs.length > 0 && (
          <div className="text-center text-gray-500 text-sm py-4">
            Todas as vagas foram carregadas
          </div>
        )}
      </div>
    </div>
  );
}
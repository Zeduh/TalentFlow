'use client';

import { useParams, useRouter } from "next/navigation";
import { JobDetail } from "./JobDetail";
import { CandidateList } from "./CandidateList";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
        >
          ← Voltar para vagas
        </button>
        <JobDetail jobId={jobId} />
        <CandidateList jobId={jobId} />
      </div>
    </main>
  );
}
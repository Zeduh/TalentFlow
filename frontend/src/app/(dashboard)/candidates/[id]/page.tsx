"use client";
import { CandidateDetail } from "./CandidateDetail";
import { useParams } from "next/navigation";

export default function CandidateDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-xl">
        <CandidateDetail id={id} />
      </div>
    </main>
  );
}
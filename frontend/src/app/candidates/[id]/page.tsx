import { CandidateDetail } from "./CandidateDetail";

type Props = {
  params: { id: string };
};

export default function CandidateDetailPage({ params }: Props) {
  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-xl">
        <CandidateDetail id={params.id} />
      </div>
    </main>
  );
}
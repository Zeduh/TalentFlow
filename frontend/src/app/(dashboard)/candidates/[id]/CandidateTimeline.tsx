import { Candidate } from "@/hooks/useCandidates";
import { CandidateStatusBadge } from "@/components/CandidateStatusBadge";

const STATUS_ORDER = [
  { value: "applied", label: "Inscrito" },
  { value: "screening", label: "Triagem" },
  { value: "interview_scheduled", label: "Entrevista" },
  { value: "offer", label: "Oferta" },
  { value: "hired", label: "Contratado" },
  { value: "rejected", label: "Rejeitado" },
];

type Props = {
  status: Candidate["status"];
};

export function CandidateTimeline({ status }: Props) {
  const currentIdx = STATUS_ORDER.findIndex((s) => s.value === status);

  return (
    <div className="flex justify-center w-full">
      <ol className="relative flex flex-col gap-4 w-full max-w-xs pr-0">
        {/* Linha vertical fina e centralizada */}
        <span className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-0.5 bg-blue-100" aria-hidden />
        {STATUS_ORDER.map((step, idx) => (
          <li
            key={step.value}
            className="relative flex items-center gap-3 min-h-[36px]"
          >
            {/* Espaço à esquerda */}
            <div className="flex-1" />
            {/* Círculo centralizado na linha */}
            <span
              className={`z-10 w-7 h-7 flex items-center justify-center rounded-full border-2 text-base font-bold
                ${idx < currentIdx
                  ? "bg-blue-600 border-blue-600 text-white"
                  : idx === currentIdx
                  ? "bg-white border-blue-600 text-blue-600 shadow"
                  : "bg-gray-200 border-gray-300 text-gray-400"
                }
              `}
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              {idx + 1}
            </span>
            {/* Conteúdo alinhado à direita da linha */}
            <div className="flex-1 pl-12 text-left">
              {idx === currentIdx ? (
                <CandidateStatusBadge status={status} />
              ) : (
                <span className="text-gray-500 text-sm">{step.label}</span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
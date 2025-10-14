"use client";
import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useInterviews } from "@/hooks/useInterviews";
import { InterviewStatusBadge } from "@/components/InterviewStatusBadge";
import { ptBR } from "date-fns/locale";
import { format, parse, startOfWeek, getDay } from "date-fns";

const locales = { "pt-BR": ptBR };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export function InterviewCalendar() {
  const { data, isLoading, isError } = useInterviews({ limit: 100 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 720);
    const onResize = () => setIsMobile(window.innerWidth <= 720);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (isLoading) return <div>Carregando calendário...</div>;
  if (isError) return <div>Erro ao carregar entrevistas.</div>;

  const interviews = data?.pages.flatMap((page) => page.data) ?? [];
  const events = interviews.map((interview) => ({
    id: interview.id,
    title: `${interview.candidateName || "Candidato"} (${interview.jobTitle || "Vaga"})`,
    start: new Date(interview.scheduledAt),
    end: new Date(interview.scheduledAt),
    resource: interview,
  }));

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-2 sm:p-4 overflow-x-auto">
      {isMobile && (
        <div className="mb-2 text-xs text-gray-600">
          Arraste para o lado para ver todos os dias ou use o modo agenda.
        </div>
      )}
      <div style={{ minWidth: 600 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{
            height: isMobile ? 350 : 500,
            minWidth: 600,
          }}
          popup
          defaultView={isMobile ? "agenda" : "month"}
          messages={{
            today: "Hoje",
            previous: "Anterior",
            next: "Próximo",
            month: "Mês",
            week: "Semana",
            day: "Dia",
            agenda: "Agenda",
            showMore: (total: number) => `+${total} mais`,
          }}
          components={{
            event: ({ event }: { event: any }) => (
              <span>
                <InterviewStatusBadge status={event.resource.status} />{" "}
                {event.title}
              </span>
            ),
          }}
        />
      </div>
    </div>
  );
}
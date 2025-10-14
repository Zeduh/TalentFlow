"use client";
import { useState, useEffect } from "react";
import { InterviewList } from "./InterviewList";
import { InterviewCalendar } from "./InterviewCalendar";
import { InterviewFormModal } from "./InterviewFormModal";
import { InterviewFilters } from "./InterviewFilters";

export default function InterviewsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState<"list" | "calendar">("list");
  const [isMobile, setIsMobile] = useState(false); // <= 720px
  const [isTablet, setIsTablet] = useState(false); // < 790px
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 720);
      setIsTablet(window.innerWidth < 790);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-extrabold text-blue-800 tracking-tight">Entrevistas</h1>
        </div>
        {/* Filtros e botões de abas juntos */}
        <InterviewFilters
          filters={filters}
          onChange={setFilters}
          tab={tab}
          onTabChange={setTab}
          hideTabs={isMobile}
        />
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          {/* Em mobile, sempre mostra a lista. Em tablet, mostra cards. Em desktop, mostra conforme a aba */}
          {isMobile ? (
            <InterviewList filters={filters} isTablet={isTablet} />
          ) : (
            tab === "list" ? <InterviewList filters={filters} isTablet={isTablet} /> : <InterviewCalendar />
          )}
        </div>
        <InterviewFormModal open={modalOpen} onClose={() => setModalOpen(false)} candidateId="" />
      </div>
    </main>
  );
}
"use client";
import { useAuth } from "@/hooks/useAuth";
import { useTenants } from "@/hooks/useTenants";

type Props = {
  filters: {
    status?: string;
    organizationId?: string;
  };
  onChange: (filters: Props["filters"]) => void;
  tab: "list" | "calendar";
  onTabChange: (tab: "list" | "calendar") => void;
  hideTabs?: boolean;
};

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "scheduled", label: "Agendada" },
  { value: "completed", label: "Concluída" },
  { value: "cancelled", label: "Cancelada" },
];

export function InterviewFilters({ filters, onChange, tab, onTabChange, hideTabs }: Props) {
  const { user } = useAuth();
  const { data: tenants } = useTenants();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 w-full">
        <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
          <label htmlFor="status-filter" className="font-semibold text-gray-800 text-sm md:text-base">
            Status:
          </label>
          <select
            id="status-filter"
            className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 font-medium bg-white w-full md:w-40"
            value={filters.status || ""}
            onChange={e => onChange({ ...filters, status: e.target.value || undefined })}
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {user?.role === "admin" && (
            <>
              <label htmlFor="tenant-filter" className="font-semibold text-gray-800 text-sm md:text-base">
                Organização:
              </label>
              <select
                id="tenant-filter"
                className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 font-medium bg-white w-full md:w-40"
                value={filters.organizationId || ""}
                onChange={e => onChange({ ...filters, organizationId: e.target.value || undefined })}
              >
                <option value="">Todos</option>
                {tenants?.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </>
          )}
        </div>
        {!hideTabs && (
          <div className="flex gap-2 w-full md:w-auto">
            <button
              className={`flex-1 md:flex-none px-3 py-2 rounded text-sm font-medium transition-colors duration-150 ${
                tab === "list"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => onTabChange("list")}
              type="button"
            >
              Lista
            </button>
            <button
              className={`flex-1 md:flex-none px-3 py-2 rounded text-sm font-medium transition-colors duration-150 ${
                tab === "calendar"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => onTabChange("calendar")}
              type="button"
            >
              Calendário
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
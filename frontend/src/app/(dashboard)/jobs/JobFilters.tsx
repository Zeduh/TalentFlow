import React from "react";

type StatusOption = {
  value: string;
  label: string;
};

const STATUS_OPTIONS: StatusOption[] = [
  { value: "", label: "Todos" },
  { value: "open", label: "Abertas" },
  { value: "closed", label: "Fechadas" },
  { value: "paused", label: "Pausadas" },
];

type JobFiltersProps = {
  status: string;
  onStatusChange: (status: string) => void;
};

export function JobFilters({ status, onStatusChange }: JobFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
      <label htmlFor="status-filter" className="font-semibold text-gray-800 text-sm md:text-base">
        Status:
      </label>
      <select
        id="status-filter"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 font-medium bg-white w-full md:w-40"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
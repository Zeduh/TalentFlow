import { useTenants } from "@/hooks/useTenants";

type TenantFilterProps = {
  tenant: string | undefined;
  onTenantChange: (tenantId: string) => void;
};

export function TenantFilter({ tenant, onTenantChange }: TenantFilterProps) {
  const { data: tenants, isLoading } = useTenants();

  return (
    <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
      <label htmlFor="tenant-filter" className="font-semibold text-gray-800 text-sm md:text-base">
        Organização:
      </label>
      <select
        id="tenant-filter"
        value={tenant || ""}
        onChange={(e) => onTenantChange(e.target.value)}
        className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 font-medium bg-white w-full md:w-56"
        disabled={isLoading}
      >
        <option value="">Todas</option>
        {tenants?.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}
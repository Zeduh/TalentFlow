export function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-2xl md:text-3xl font-bold text-blue-800 mb-6">
      {children}
    </h1>
  );
}
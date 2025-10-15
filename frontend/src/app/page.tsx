import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Bem-vindo ao TalentFlow!</h1>
      <Link href="/login" className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition">
        Entrar
      </Link>
    </main>
  );
}
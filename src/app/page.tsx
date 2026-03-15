import SoulRequirementsLookup from '@/components/SoulRequirementsLookup';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-900">
          Slayer Legends Optimizer
        </h1>
        <SoulRequirementsLookup />
      </div>
    </main>
  );
}

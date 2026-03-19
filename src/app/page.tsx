import SoulRequirementsLookup from '@/components/SoulRequirementsLookup';
import { ConstellationBuffSummary } from '@/components/ConstellationBuffSummary/ConstellationBuffSummary';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <header className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">
            Slayer Legends Optimizer
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Build planner and stat optimizer
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Navigation section — links added in #128 */}
          <section
            className="lg:col-span-2"
            aria-labelledby="nav-section-heading"
          >
            <h2
              id="nav-section-heading"
              className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3"
            >
              Sections
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Navigation cards will be added in issue #128 */}
            </div>
            <div className="mt-6">
              <SoulRequirementsLookup />
            </div>
          </section>

          {/* Info panel */}
          <aside className="flex flex-col gap-4">
            {/* Version display — content added in #129 */}
            <section
              className="bg-white rounded-lg border border-gray-200 p-4"
              aria-labelledby="version-heading"
            >
              <h2
                id="version-heading"
                className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
              >
                Version
              </h2>
              <div className="text-sm text-gray-500">—</div>
            </section>

            {/* Constellation buff summary */}
            <section
              className="bg-white rounded-lg border border-gray-200 p-4"
              aria-labelledby="constellation-summary-heading"
            >
              <h2
                id="constellation-summary-heading"
                className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
              >
                Constellation Buffs
              </h2>
              <ConstellationBuffSummary />
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

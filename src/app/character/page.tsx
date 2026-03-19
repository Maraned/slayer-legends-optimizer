import { EnhanceSection } from '@/components/EnhanceSection/EnhanceSection';
import { GrowthStrInput } from '@/components/GrowthStrInput';

export default function CharacterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Character</h1>
          <p className="mt-1 text-sm text-gray-500">Manual stat calculator</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Enhance section — section 6.3.1 */}
        <section aria-labelledby="enhance-heading" className="bg-white rounded-lg border border-gray-200 p-6">
          <h2
            id="enhance-heading"
            className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4"
          >
            Enhance
          </h2>
          <EnhanceSection />
        </section>

        {/* Growth section — section 6.7 */}
        <section aria-labelledby="growth-heading" className="bg-white rounded-lg border border-gray-200 p-6">
          <h2
            id="growth-heading"
            className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4"
          >
            Growth
          </h2>
          <GrowthStrInput />
        </section>
      </div>
    </div>
  );
}

import SoulRequirementsLookup from '@/components/SoulRequirementsLookup';
import { ConstellationBuffSummary } from '@/components/ConstellationBuffSummary/ConstellationBuffSummary';
import { version } from '../../package.json';
import Link from 'next/link';
import { Card } from '@/components/Card';

const SECTION_GROUPS = [
  {
    label: 'Characters',
    items: [
      { label: 'Characters', href: '/characters', description: 'View and manage your characters' },
      { label: 'Skills', href: '/skills', description: 'Skill trees and elemental multipliers' },
      { label: 'Skill Mastery', href: '/skill-mastery', description: 'Mastery node progression across 8 pages' },
      { label: 'Companions', href: '/companions', description: 'Companion management and advancement' },
      { label: 'Familiars', href: '/familiars', description: 'Familiar collection and upgrades' },
      { label: 'Sprites', href: '/sprites', description: 'Character appearance customization' },
    ],
  },
  {
    label: 'Equipment',
    items: [
      { label: 'Equipment', href: '/equipment', description: 'Weapons and accessories management' },
      { label: 'Cube Optimizer', href: '/cube-optimizer', description: 'Weapon tier optimization' },
    ],
  },
  {
    label: 'World',
    items: [
      { label: 'Stages', href: '/stages', description: 'Dungeon and stage farming' },
      { label: 'Constellations', href: '/constellations', description: 'Star and zodiac progression' },
    ],
  },
  {
    label: 'Optimizer',
    items: [
      { label: 'Black Orb', href: '/black-orb', description: 'Elemental damage and amplification' },
      { label: 'Tree of Memory', href: '/tree-of-memory', description: 'Memory and skill tree progression' },
    ],
  },
];

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
          {/* Navigation section */}
          <section
            className="lg:col-span-2"
            aria-labelledby="nav-section-heading"
          >
            <div className="space-y-8">
              {SECTION_GROUPS.map((group) => (
                <div key={group.label}>
                  <h2
                    id="nav-section-heading"
                    className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3"
                  >
                    {group.label}
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {group.items.map((item) => (
                      <Link key={item.href} href={item.href} className="block group">
                        <Card className="h-full transition-shadow group-hover:shadow-md">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <SoulRequirementsLookup />
            </div>
          </section>

          {/* Info panel */}
          <aside className="flex flex-col gap-4">
            {/* Version display */}
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
              <div className="text-sm text-gray-500">v{version}</div>
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

"use client";

import Link from "next/link";
import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

type NavItem = {
  label: string;
  href: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
];

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Characters",
    items: [
      { label: "Characters", href: "/characters" },
      { label: "Skills", href: "/skills" },
      { label: "Companions", href: "/companions" },
      { label: "Familiars", href: "/familiars" },
      { label: "Sprites", href: "/sprites" },
    ],
  },
  {
    label: "Equipment",
    items: [
      { label: "Equipment", href: "/equipment" },
      { label: "Cube Optimizer", href: "/cube-optimizer" },
    ],
  },
  {
    label: "World",
    items: [
      { label: "Stages", href: "/stages" },
      { label: "Constellations", href: "/constellations" },
    ],
  },
  {
    label: "Optimizer",
    items: [
      { label: "Black Orb", href: "/black-orb" },
      { label: "Tree of Memory", href: "/tree-of-memory" },
    ],
  },
];

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <div className="flex flex-col justify-center items-center w-6 h-6 gap-1.5">
      <span
        className={`block h-0.5 w-6 bg-current transition-all duration-200 ${open ? "translate-y-2 rotate-45" : ""}`}
      />
      <span
        className={`block h-0.5 w-6 bg-current transition-all duration-200 ${open ? "opacity-0" : ""}`}
      />
      <span
        className={`block h-0.5 w-6 bg-current transition-all duration-200 ${open ? "-translate-y-2 -rotate-45" : ""}`}
      />
    </div>
  );
}

export function NavigationMenu() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="w-full bg-[var(--color-background)] border-b border-[var(--color-foreground)]/10">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-semibold text-sm tracking-wide text-[var(--color-foreground)] hover:opacity-70 transition-opacity"
        >
          Slayer Legends Optimizer
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 text-sm rounded-md text-[var(--color-foreground)]/80 hover:text-[var(--color-foreground)] hover:bg-[var(--color-foreground)]/5 transition-colors"
            >
              {item.label}
            </Link>
          ))}
          {NAV_GROUPS.map((group) => (
            <DropdownMenu.Root key={group.label}>
              <DropdownMenu.Trigger asChild>
                <button className="px-3 py-1.5 text-sm rounded-md text-[var(--color-foreground)]/80 hover:text-[var(--color-foreground)] hover:bg-[var(--color-foreground)]/5 transition-colors flex items-center gap-1 outline-none cursor-pointer">
                  {group.label}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-40 bg-[var(--color-background)] border border-[var(--color-foreground)]/10 rounded-lg shadow-lg p-1 z-50 animate-in fade-in-0 zoom-in-95"
                  sideOffset={4}
                >
                  {group.items.map((item) => (
                    <DropdownMenu.Item key={item.href} asChild>
                      <Link
                        href={item.href}
                        className="block px-3 py-2 text-sm rounded-md text-[var(--color-foreground)]/80 hover:text-[var(--color-foreground)] hover:bg-[var(--color-foreground)]/5 transition-colors outline-none cursor-pointer"
                      >
                        {item.label}
                      </Link>
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ))}
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <DropdownMenu.Root open={mobileOpen} onOpenChange={setMobileOpen}>
            <DropdownMenu.Trigger asChild>
              <button
                aria-label="Toggle navigation menu"
                className="p-2 rounded-md text-[var(--color-foreground)] hover:bg-[var(--color-foreground)]/5 transition-colors outline-none cursor-pointer"
              >
                <HamburgerIcon open={mobileOpen} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="w-56 bg-[var(--color-background)] border border-[var(--color-foreground)]/10 rounded-lg shadow-lg p-2 z-50 mr-4"
                sideOffset={8}
                align="end"
              >
                {NAV_ITEMS.map((item) => (
                  <DropdownMenu.Item key={item.href} asChild>
                    <Link
                      href={item.href}
                      className="block px-3 py-2 text-sm rounded-md text-[var(--color-foreground)]/80 hover:text-[var(--color-foreground)] hover:bg-[var(--color-foreground)]/5 transition-colors outline-none"
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </DropdownMenu.Item>
                ))}
                {NAV_GROUPS.map((group) => (
                  <div key={group.label}>
                    <DropdownMenu.Separator className="my-1 h-px bg-[var(--color-foreground)]/10" />
                    <p className="px-3 py-1 text-xs font-medium text-[var(--color-foreground)]/50 uppercase tracking-wider">
                      {group.label}
                    </p>
                    {group.items.map((item) => (
                      <DropdownMenu.Item key={item.href} asChild>
                        <Link
                          href={item.href}
                          className="block px-3 py-2 text-sm rounded-md text-[var(--color-foreground)]/80 hover:text-[var(--color-foreground)] hover:bg-[var(--color-foreground)]/5 transition-colors outline-none"
                          onClick={() => setMobileOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </DropdownMenu.Item>
                    ))}
                  </div>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </nav>
  );
}

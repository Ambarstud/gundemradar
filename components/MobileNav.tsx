'use client';

import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { id: 'borsa',     label: 'Borsa',   icon: '📈' },
  { id: 'doviz',     label: 'Döviz',   icon: '💰' },
  { id: 'portfoy',   label: 'Portföy', icon: '💼' },
  { id: 'trendler',  label: 'Trend',   icon: '𝕏' },
  { id: 'haberler',  label: 'Haber',   icon: '📰' },
] as const;

export default function MobileNav() {
  const [active, setActive] = useState('borsa');

  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5] }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActive(id);
    }
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 mobile-nav"
      aria-label="Mobil navigasyon"
    >
      <div className="mobile-nav-inner">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className={`mobile-nav-item ${active === item.id ? 'mobile-nav-active' : ''}`}
            aria-current={active === item.id ? 'page' : undefined}
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span className="text-[9px] font-semibold tracking-wide">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

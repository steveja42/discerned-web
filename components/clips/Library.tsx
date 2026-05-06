// Private Library — shows clips delivered from the Discerned extension via postMessage.
// Renders a folder sidebar, clip list, and detail panel. If the bridge times out (2s)
// with no extension present, shows LibraryEmpty with the install prompt instead.

'use client';

import { useState, useMemo } from 'react';
import { useLibraryBridge } from '@/hooks/useLibraryBridge';
import { CATEGORIES, INTEREST_LEVELS } from '@/lib/constants';
import type { GlyphVariant } from '@/components/glyph/Glyph';
import ClipRow from '@/components/feed/ClipRow';
import DetailPanel from '@/components/feed/DetailPanel';
import LibraryEmpty from './LibraryEmpty';

interface SidebarLocalProps {
  activeCat: string | null;
  setActiveCat: (c: string | null) => void;
  catCounts: Record<string, number>;
  totalCount: number;
}

function SidebarLocal({ activeCat, setActiveCat, catCounts, totalCount }: SidebarLocalProps) {
  return (
    <aside className="sidebar">
      <div>
        <div className="side-section-label">View</div>
        <ul className="nav-list">
          <li
            className={`nav-item ${activeCat === null ? 'active' : ''}`}
            onClick={() => setActiveCat(null)}
          >
            All clips <span className="nav-count">{totalCount}</span>
          </li>
        </ul>
      </div>

      <div>
        <div className="side-section-label">
          Folders <span className="count">{Object.keys(CATEGORIES).length}</span>
        </div>
        <ul className="nav-list folder-list">
          {Object.entries(CATEGORIES).map(([key, cat]) => {
            const c = catCounts[key] ?? 0;
            const active = activeCat === key;
            return (
              <li
                key={key}
                className={`nav-item folder ${active ? 'active' : ''}`}
                onClick={() => setActiveCat(active ? null : key)}
              >
                <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke={`oklch(0.50 0.08 ${cat.hue})`} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                  {active
                    ? <><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2" /><path d="m3 9 2 9a2 2 0 0 0 2 1.5h12a2 2 0 0 0 2-1.5l1.5-7a1 1 0 0 0-1-1.2H5" /></>
                    : <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />}
                </svg>
                <span style={{ flex: 1 }}>{cat.label}</span>
                <span className="nav-count">{c}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="filters">
        <div className="side-section-label">Filter by dimension</div>
        <div className="axis-filter">
          <div className="axis-filter-head">
            <span>Interest</span>
            <span className="axis-letter">I</span>
          </div>
          <div className="axis-range">
            {INTEREST_LEVELS.map((lvl, i) => (
              <div key={lvl} className="pip" title={lvl}>{lvl[0]}</div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

interface LibraryProps {
  glyphVariant?: GlyphVariant;
}

export default function Library({ glyphVariant = 'bars' }: LibraryProps) {
  const { bridgePresent, clips, timedOut } = useLibraryBridge();
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() =>
    clips.filter((c) => !activeCat || c.evaluation.category === activeCat),
    [clips, activeCat],
  );

  const selected = filtered.find((c) => c.capture.id === selectedId) ?? filtered[0] ?? null;

  const catCounts = useMemo(() => {
    const m: Record<string, number> = {};
    clips.forEach((c) => { m[c.evaluation.category] = (m[c.evaluation.category] ?? 0) + 1; });
    return m;
  }, [clips]);

  const showEmpty = timedOut && !bridgePresent;

  return (
    <div className="app">
      <div className="main">
        <SidebarLocal
          activeCat={activeCat}
          setActiveCat={setActiveCat}
          catCounts={catCounts}
          totalCount={clips.length}
        />

        <main className="feed-col">
          <div className="feed-head">
            <div>
              <h1 className="feed-title">
                {activeCat
                  ? <>{CATEGORIES[activeCat]?.label ?? activeCat} </>
                  : <>Your <em>Library</em></>}
              </h1>
              <div className="feed-meta">
                {clips.length} clips
                <span className="sep">·</span>
                stored locally · IndexedDB
                <span className="sep">·</span>
                {bridgePresent ? 'extension connected' : 'private'}
              </div>
            </div>
          </div>

          {showEmpty ? (
            <LibraryEmpty />
          ) : !bridgePresent ? (
            <div className="feed-empty">Waiting for extension…</div>
          ) : filtered.length === 0 ? (
            <div className="feed-empty">No clips in this folder.</div>
          ) : (
            <div className="feed-list">
              {filtered.map((clip) => (
                <ClipRow
                  key={clip.capture.id}
                  clip={clip}
                  selected={selected?.capture.id === clip.capture.id}
                  onClick={() => setSelectedId(clip.capture.id)}
                  glyphVariant={glyphVariant}
                />
              ))}
            </div>
          )}

          <div className="sov-strip">
            <span className="item"><span className="ok-dot" />Local-first · IndexedDB</span>
            <span className="spacer" />
            <span className="item"><a>Export JSON</a></span>
          </div>
        </main>

        <DetailPanel clip={selected} onClose={() => setSelectedId(null)} />
      </div>
    </div>
  );
}

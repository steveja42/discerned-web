// Private Library — shows clips delivered from the Discerned extension via postMessage.
// Renders a folder sidebar, clip list, and detail panel. If the bridge times out (2s)
// with no extension present, shows LibraryEmpty with the install prompt instead.

'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import type React from 'react';
import { useLibraryBridge } from '@/hooks/useLibraryBridge';
import { CATEGORIES, INTEREST_LEVELS, ETHICS_LEVELS, interestRank, ethicsRank } from '@/lib/constants';

function categoryHue(name: string): number {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h) % 360;
}
import type { GlyphVariant } from '@/components/glyph/Glyph';
import ClipRow from '@/components/feed/ClipRow';
import DetailPanel from '@/components/feed/DetailPanel';
import LibraryEmpty from './LibraryEmpty';
import BulkActionBar from './BulkActionBar';
import ResizableLayout from '@/components/layout/ResizableLayout';
import { ImportDialog } from './ImportDialog';
import { exportClipsJson, exportClipsCsv } from '@/lib/export-utils';

interface SidebarLocalProps {
  activeCat: string | null;
  setActiveCat: (c: string | null) => void;
  catCounts: Record<string, number>;
  totalCount: number;
  interestMin: number;
  setInterestMin: (n: number) => void;
  ethicsMin: number;
  setEthicsMin: (n: number) => void;
  allCategories: Record<string, { label: string; hue: number }>;
}

function SidebarLocal({ activeCat, setActiveCat, catCounts, totalCount, interestMin, setInterestMin, ethicsMin, setEthicsMin, allCategories }: SidebarLocalProps) {
  return (
    <aside className="sidebar">
      <div className="side-section-label" style={{ fontSize: '1.25rem', fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 700, letterSpacing: 0, textTransform: 'none', color: 'var(--ink)', marginBottom: '0.3rem' }}>Library</div>
      <div>
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
          Folders <span className="count">{Object.keys(allCategories).length}</span>
        </div>
        <ul className="nav-list folder-list">
          {Object.entries(allCategories).map(([key, cat]) => {
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
            <span>
              Interest{' '}
              <span style={{ color: 'var(--ink-4)', fontWeight: 400, fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {interestMin === 0 ? '—' : `≥ ${INTEREST_LEVELS[interestMin - 1]}`}
              </span>
            </span>
            <span className="axis-letter">I</span>
          </div>
          <div className="axis-range">
            {INTEREST_LEVELS.map((lvl, i) => (
              <div
                key={lvl}
                className={`pip ${i + 1 <= interestMin ? 'active interest' : ''}`}
                onClick={() => setInterestMin(i + 1 === interestMin ? 0 : i + 1)}
                title={lvl}
              >
                {lvl[0]}
              </div>
            ))}
          </div>
        </div>
        <div className="axis-filter">
          <div className="axis-filter-head">
            <span>
              Ethics{' '}
              <span style={{ color: 'var(--ink-4)', fontWeight: 400, fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {ethicsMin === 0 ? '—' : `≥ ${ETHICS_LEVELS[ethicsMin - 1]}`}
              </span>
            </span>
            <span className="axis-letter">E</span>
          </div>
          <div className="axis-range">
            {ETHICS_LEVELS.map((lvl, i) => (
              <div
                key={lvl}
                className={`pip ${i + 1 <= ethicsMin ? 'active ethics' : ''}`}
                onClick={() => setEthicsMin(i + 1 === ethicsMin ? 0 : i + 1)}
                title={lvl}
              >
                {lvl[0]}
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

interface LibraryProps {
  glyphVariant?: GlyphVariant;
  initialClipId?: string;
}

export default function Library({ glyphVariant = 'bars', initialClipId }: LibraryProps) {
  const { bridgePresent, clips, timedOut, customCategories, removeClips, updateClipNote, addClips, addCustomCategories, focusClipId, clearFocusClipId } = useLibraryBridge();
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    if (focusClipId) {
      setSelectedId(focusClipId);
      clearFocusClipId();
    }
  }, [focusClipId, clearFocusClipId]);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [interestMin, setInterestMin] = useState(0);
  const [ethicsMin, setEthicsMin] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(initialClipId ?? null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() =>
    clips.filter((c) =>
      (!activeCat || c.evaluation.category === activeCat) &&
      interestRank(c.evaluation.interest) + 1 >= interestMin &&
      ethicsRank(c.evaluation.ethics) + 1 >= ethicsMin,
    ),
    [clips, activeCat, interestMin, ethicsMin],
  );

  const selected = filtered.find((c) => c.capture.id === selectedId) ?? filtered[0] ?? null;

  const catCounts = useMemo(() => {
    const m: Record<string, number> = {};
    clips.forEach((c) => { m[c.evaluation.category] = (m[c.evaluation.category] ?? 0) + 1; });
    return m;
  }, [clips]);

  const allCategories = useMemo(() => {
    const custom: Record<string, { label: string; hue: number }> = {};
    customCategories.forEach((cat) => {
      custom[cat] = { label: cat, hue: categoryHue(cat) };
    });
    return { ...CATEGORIES, ...custom };
  }, [customCategories]);

  const showEmpty = timedOut && !bridgePresent;

  // Tracks the last clip clicked without shift, for shift-range selection.
  const lastClickedId = useRef<string | null>(null);

  const handleSelectToggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    lastClickedId.current = id;
  };

  const handleRowClick = (id: string, e: React.MouseEvent) => {
    const isCtrl = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;

    if (isShift && lastClickedId.current) {
      // Range select: select all clips between lastClickedId and id.
      const ids = filtered.map((c) => c.capture.id);
      const a = ids.indexOf(lastClickedId.current);
      const b = ids.indexOf(id);
      if (a !== -1 && b !== -1) {
        const [lo, hi] = a < b ? [a, b] : [b, a];
        const rangeIds = ids.slice(lo, hi + 1);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          rangeIds.forEach((rid) => next.add(rid));
          return next;
        });
      }
      return;
    }

    if (isCtrl) {
      // Toggle this clip into/out of selection.
      handleSelectToggle(id);
      return;
    }

    if (selectedIds.size > 0) {
      // In select mode: plain click toggles.
      handleSelectToggle(id);
      return;
    }

    // Normal click: open detail.
    lastClickedId.current = id;
    setSelectedId(id);
  };

  const handleBulkDelete = () => {
    const ids = [...selectedIds];
    removeClips(ids);
    setSelectedIds(new Set());
    if (selectedId && selectedIds.has(selectedId)) setSelectedId(null);
  };

  const handleSingleDelete = (id: string) => {
    removeClips([id]);
    if (selectedId === id) setSelectedId(null);
  };

  const feedContent = (
    <main className="feed-col">
      <div className="feed-scroll">
        {showEmpty ? (
          <LibraryEmpty />
        ) : !bridgePresent ? (
          <div className="feed-empty">Waiting for extension…</div>
        ) : filtered.length === 0 ? (
          <div className="feed-empty">No clips match these filters.</div>
        ) : (
          <div className="feed-list">
            {filtered.map((clip, i) => (
              <ClipRow
                key={clip.capture.id ?? i}
                clip={clip}
                selected={selected?.capture.id === clip.capture.id}
                onClick={(e) => handleRowClick(clip.capture.id, e)}
                glyphVariant={glyphVariant}
                isSelectMode={selectedIds.size > 0}
                isSelected={selectedIds.has(clip.capture.id)}
                onSelect={handleSelectToggle}
              />
            ))}
          </div>
        )}
      </div>

      <BulkActionBar
        count={selectedIds.size}
        onDelete={handleBulkDelete}
        onClear={() => setSelectedIds(new Set())}
      />

      <div className="sov-strip">
        <span className="item"><span className="ok-dot" />Local-first · IndexedDB</span>
        <span className="spacer" />
        <span className="item"><a onClick={() => setImportOpen(true)} style={{ cursor: 'pointer' }}>Import</a></span>
        <span className="item"><a onClick={() => exportClipsJson(clips)} style={{ cursor: 'pointer' }}>Export JSON</a></span>
        <span className="item"><a onClick={() => exportClipsCsv(clips)} style={{ cursor: 'pointer' }}>Export CSV</a></span>
      </div>
    </main>
  );

  return (
    <div className="app">
      {importOpen && (
        <ImportDialog
          bridgePresent={bridgePresent}
          existingCustomCategories={customCategories}
          onClose={() => setImportOpen(false)}
          onClipsImported={addClips}
          onCategoriesCreated={addCustomCategories}
        />
      )}
      <ResizableLayout
        sidebar={
          <SidebarLocal
            activeCat={activeCat}
            setActiveCat={setActiveCat}
            catCounts={catCounts}
            totalCount={clips.length}
            interestMin={interestMin}
            setInterestMin={setInterestMin}
            ethicsMin={ethicsMin}
            setEthicsMin={setEthicsMin}
            allCategories={allCategories}
          />
        }
        feed={feedContent}
        detail={
          <DetailPanel
            clip={selected}
            onDelete={handleSingleDelete}
            onUpdateNote={updateClipNote}
          />
        }
        initialSidebarWidth={200}
      />
    </div>
  );
}

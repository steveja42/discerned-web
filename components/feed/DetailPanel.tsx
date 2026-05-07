// Right-rail detail panel — renders the selected clip's full excerpt, axis track bars,
// category swatch, and action buttons. Shows a placeholder when no clip is selected.

'use client';

import type { ClipData } from '@/lib/types';
import { CATEGORIES, INTEREST_LEVELS, ETHICS_LEVELS, interestRank, ethicsRank } from '@/lib/constants';
import { interestColor, ethicsColor } from '@/lib/dimensionColor';

interface DetailPanelProps {
  clip: ClipData | null;
  onClose: () => void;
}

function domainOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

function favLetter(domain: string): string {
  return domain.charAt(0).toUpperCase();
}

function favColor(domain: string): string {
  let h = 0;
  for (const c of domain) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  const hue = Math.abs(h) % 360;
  return `oklch(0.30 0.08 ${hue})`;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const h = Math.floor(diff / 3600_000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Yesterday';
  return `${d} days ago`;
}

export default function DetailPanel({ clip, onClose }: DetailPanelProps) {
  if (!clip) {
    return (
      <aside className="detail">
        <div className="detail-empty">
          <div className="glyph-big">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
            </svg>
          </div>
          <p>Select a clip to read its excerpt, ratings, and who else has discerned it.</p>
        </div>
      </aside>
    );
  }

  const { capture, evaluation } = clip;
  const domain = domainOf(capture.url);
  const cat = CATEGORIES[evaluation.category] ?? { label: evaluation.category, hue: 60 };
  const iIdx = interestRank(evaluation.interest);
  const eIdx = ethicsRank(evaluation.ethics);

  return (
    <aside className="detail">
      <div className="detail-head">
        <div className="detail-source">
          <span className="fav" style={{ background: favColor(domain) }}>{favLetter(domain)}</span>
          <span className="domain">{domain}</span>
          <span style={{ color: 'var(--ink-4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
            {capture.url}
          </span>
          <button className="detail-close" onClick={onClose} aria-label="Close">
            <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <h2 className="detail-title">{capture.title}</h2>
        <div className="detail-byline">{timeAgo(capture.timestamp)}</div>
      </div>

      {(capture.bodyHtml || capture.selectionText) ? (
        <div className="detail-section">
          <div className="detail-section-label">Highlighted excerpt</div>
          <iframe
            className="clip-frame"
            srcDoc={capture.bodyHtml ?? capture.selectionText}
            sandbox="allow-same-origin"
            title="Clip content"
          />
          {capture.note && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--rule-soft)' }}>
              <div className="detail-section-label" style={{ marginBottom: 8 }}>Note</div>
              <p style={{ margin: 0, fontFamily: 'var(--sans)', fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-2)' }}>{capture.note}</p>
            </div>
          )}
        </div>
      ) : capture.bodyText ? (
        <div className="detail-section">
          <div className="detail-section-label">Highlighted excerpt</div>
          <blockquote className="detail-excerpt">{capture.bodyText}</blockquote>
          {capture.note && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--rule-soft)' }}>
              <div className="detail-section-label" style={{ marginBottom: 8 }}>Note</div>
              <p style={{ margin: 0, fontFamily: 'var(--sans)', fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-2)' }}>{capture.note}</p>
            </div>
          )}
        </div>
      ) : null}

      <div className="detail-section">
        <div className="detail-section-label">Assessment</div>
        <div className="axis-display">
          <div className="axis-large">
            <div className="axis-name">
              Interest
              <small>{INTEREST_LEVELS[0]} → {INTEREST_LEVELS[4]}</small>
            </div>
            <div className="axis-track">
              {INTEREST_LEVELS.map((lvl, i) => (
                <div key={lvl} className={`seg ${i <= iIdx ? 'on interest' : ''}`} title={lvl} style={i <= iIdx ? { background: interestColor(i, 1, 4) } : undefined} />
              ))}
            </div>
            <div className="axis-num" style={{ fontSize: 11, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {evaluation.interest}
            </div>
          </div>
          <div className="axis-large">
            <div className="axis-name">
              Ethics
              <small>{ETHICS_LEVELS[0]} → {ETHICS_LEVELS[5]}</small>
            </div>
            <div className="axis-track">
              {ETHICS_LEVELS.map((lvl, i) => (
                <div key={lvl} className={`seg ${i <= eIdx ? 'on ethics' : ''}`} title={lvl} style={i <= eIdx ? { background: ethicsColor(i, 3, 5) } : undefined} />
              ))}
            </div>
            <div className="axis-num" style={{ fontSize: 11, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {evaluation.ethics}
            </div>
          </div>
          <div className="cat-large">
            <span className="swatch-lg" style={{ background: `oklch(0.50 0.08 ${cat.hue})` }} />
            <span className="cat-name">{cat.label}</span>
            <span className="cat-meta">Category</span>
          </div>
        </div>
      </div>

      <div className="detail-actions">
        <button className="btn primary">Open source</button>
        <button className="btn ghost" style={{ marginLeft: 'auto' }}>···</button>
      </div>
    </aside>
  );
}

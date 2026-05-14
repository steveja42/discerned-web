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

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function DetailPanel({ clip }: DetailPanelProps) {
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
          <a
            href={capture.url}
            target="_blank"
            rel="noopener noreferrer"
            className="detail-url"
            title={capture.url}
          >
            {capture.url}
          </a>
          <span className="detail-byline">{formatDate(capture.timestamp)}</span>
        </div>
        <h2 className="detail-title">{capture.title}</h2>
      </div>

      <div className="detail-section">
        <div className="detail-section-header">
          <div className="detail-section-label">Assessment</div>
          <div className="detail-cat-inline">
            <span className="swatch-lg" style={{ background: `oklch(0.50 0.08 ${cat.hue})` }} />
            <span className="cat-name">{cat.label}</span>
          </div>
        </div>
        <div className="axis-display">
          <div className="axis-large" style={iIdx === 1 ? { opacity: 0.42 } : undefined}>
            <div className="axis-name">
              Interest
              <small>{INTEREST_LEVELS[0]} → {INTEREST_LEVELS[4]}</small>
            </div>
            <div className="axis-track">
              {INTEREST_LEVELS.map((lvl, i) => (
                <div key={lvl} className={`seg ${i <= iIdx ? 'on interest' : ''}`} title={lvl} style={i === iIdx ? { background: interestColor(i, 1, 4) } : undefined} />
              ))}
            </div>
            <div className="axis-num" style={{ fontSize: 11, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {evaluation.interest}
            </div>
          </div>
          <div className="axis-large" style={eIdx === 2 ? { opacity: 0.42 } : undefined}>
            <div className="axis-name">
              Ethics
              <small>{ETHICS_LEVELS[0]} → {ETHICS_LEVELS[4]}</small>
            </div>
            <div className="axis-track">
              {ETHICS_LEVELS.map((lvl, i) => (
                <div key={lvl} className={`seg ${i <= eIdx ? 'on ethics' : ''}`} title={lvl} style={i === eIdx ? { background: ethicsColor(i, 2, 4) } : undefined} />
              ))}
            </div>
            <div className="axis-num" style={{ fontSize: 11, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {evaluation.ethics}
            </div>
          </div>
        </div>
      </div>

      {(capture.bodyHtml || capture.selectionText) ? (
        <>
          {capture.note && (
            <div className="detail-section detail-note-row">
              <div className="detail-section-label">Note</div>
              <p style={{ margin: 0, fontFamily: 'var(--sans)', fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-2)' }}>{capture.note}</p>
            </div>
          )}
          <div
            className="clip-body"
            dangerouslySetInnerHTML={{ __html: capture.bodyHtml ?? capture.selectionText ?? '' }}
          />
        </>
      ) : capture.bodyText ? (
        <div className="detail-section">
          {capture.note && (
            <div className="detail-note-row" style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--rule-soft)' }}>
              <div className="detail-section-label">Note</div>
              <p style={{ margin: 0, fontFamily: 'var(--sans)', fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-2)' }}>{capture.note}</p>
            </div>
          )}
          {capture.thumbnail && (
            <img src={capture.thumbnail} alt="" className="detail-thumb" />
          )}
          <blockquote className="detail-excerpt">{capture.bodyText}</blockquote>
        </div>
      ) : null}
    </aside>
  );
}

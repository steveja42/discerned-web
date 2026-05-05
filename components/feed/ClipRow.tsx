'use client';

import type { ClipData } from '@/lib/types';
import Glyph, { type GlyphVariant } from '@/components/glyph/Glyph';

interface ClipRowProps {
  clip: ClipData;
  selected: boolean;
  onClick: () => void;
  glyphVariant?: GlyphVariant;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const h = Math.floor(diff / 3600_000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d} days ago`;
  return 'Last week';
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

export default function ClipRow({ clip, selected, onClick, glyphVariant = 'bars' }: ClipRowProps) {
  const { capture, evaluation } = clip;
  const domain = domainOf(capture.url);

  return (
    <article className={`clip ${selected ? 'selected' : ''}`} onClick={onClick}>
      <div className="clip-main">
        <div className="clip-source">
          <span className="fav" style={{ background: favColor(domain) }}>{favLetter(domain)}</span>
          <span className="domain">{domain}</span>
          <span className="dot">·</span>
          <span>{timeAgo(capture.timestamp)}</span>
          <span className="scope-tag public">● Cast</span>
        </div>
        <h3 className="clip-title">{capture.title}</h3>
        {(capture.selectionText || capture.bodyText) && (
          <p className="clip-excerpt">{capture.selectionText ?? capture.bodyText}</p>
        )}
        {capture.note && <div className="clip-note">{capture.note}</div>}
        <div className="clip-foot">
          <span className="by">
            <span className="av">N</span>
            clipped
          </span>
        </div>
      </div>
      <Glyph
        interest={evaluation.interest}
        ethics={evaluation.ethics}
        category={evaluation.category}
        variant={glyphVariant}
      />
    </article>
  );
}

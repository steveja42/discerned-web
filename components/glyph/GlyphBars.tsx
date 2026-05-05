// Horizontal bar-meter glyph — the default clip evaluation display.
// Renders Interest (5 segments) and Ethics (6 segments) as filled pip rows,
// plus a colour-coded category chip derived from the CATEGORIES hue map.

import { CATEGORIES, interestRank, ethicsRank } from '@/lib/constants';

interface GlyphBarsProps {
  interest: string;
  ethics: string;
  category: string;
}

function Bars({ value, max, kind }: { value: number; max: number; kind: string }) {
  return (
    <div className="bars">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className={`bar ${i < value ? `on ${kind}` : ''}`} />
      ))}
    </div>
  );
}

export default function GlyphBars({ interest, ethics, category }: GlyphBarsProps) {
  const cat = CATEGORIES[category] ?? { label: category, hue: 60 };
  return (
    <div className="glyph">
      <div className="glyph-row" title={`Interest: ${interest}`}>
        <span className="axis-key">I</span>
        <Bars value={interestRank(interest) + 1} max={5} kind="interest" />
        <span style={{ marginLeft: 4, color: 'var(--ink-2)', fontSize: 10 }}>{interest}</span>
      </div>
      <div className="glyph-row" title={`Ethics: ${ethics}`}>
        <span className="axis-key">E</span>
        <Bars value={ethicsRank(ethics) + 1} max={6} kind="ethics" />
        <span style={{ marginLeft: 4, color: 'var(--ink-2)', fontSize: 10 }}>{ethics}</span>
      </div>
      <div className="cat-tag">
        <span className="swatch" style={{ background: `oklch(0.50 0.08 ${cat.hue})` }} />
        {cat.label}
      </div>
    </div>
  );
}

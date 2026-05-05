import { CATEGORIES } from '@/lib/constants';

interface GlyphLetterProps {
  interest: string;
  ethics: string;
  category: string;
}

export default function GlyphLetter({ interest, ethics, category }: GlyphLetterProps) {
  const cat = CATEGORIES[category] ?? { label: category, hue: 60 };
  const iShort = interest.slice(0, 4);
  const eShort = ethics.slice(0, 4);
  return (
    <div className="glyph" style={{ alignItems: 'flex-end', minWidth: 130 }}>
      <div className="letter-grade">
        <div
          className="lg-axis interest"
          style={{ width: 'auto', padding: '0 8px', fontSize: 10, fontFamily: 'var(--mono)', fontStyle: 'normal', letterSpacing: '0.04em', textTransform: 'uppercase' }}
          title={`Interest: ${interest}`}
        >
          {iShort}
        </div>
        <div
          className="lg-axis ethics"
          style={{ width: 'auto', padding: '0 8px', fontSize: 10, fontFamily: 'var(--mono)', fontStyle: 'normal', letterSpacing: '0.04em', textTransform: 'uppercase' }}
          title={`Ethics: ${ethics}`}
        >
          {eShort}
        </div>
      </div>
      <div className="cat-tag" style={{ marginTop: 6 }}>
        <span className="swatch" style={{ background: `oklch(0.50 0.08 ${cat.hue})` }} />
        {cat.label}
      </div>
    </div>
  );
}

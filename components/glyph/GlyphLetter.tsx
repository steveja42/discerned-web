import { CATEGORIES, interestRank, ethicsRank } from '@/lib/constants';
import { interestColor, ethicsColor } from '@/lib/dimensionColor';

interface GlyphLetterProps {
  interest: string;
  ethics: string;
  category: string;
}

export default function GlyphLetter({ interest, ethics, category }: GlyphLetterProps) {
  const cat = CATEGORIES[category] ?? { label: category, hue: 60 };
  const iShort = interest.slice(0, 4);
  const eShort = ethics.slice(0, 4);
  const iColor = interestColor(interestRank(interest), 1, 4);
  const eColor = ethicsColor(ethicsRank(ethics), 3, 5);
  return (
    <div className="glyph" style={{ alignItems: 'flex-end', minWidth: 130 }}>
      <div className="letter-grade">
        <div
          className="lg-axis interest"
          style={{ width: 'auto', padding: '0 8px', fontSize: 10, fontFamily: 'var(--mono)', fontStyle: 'normal', letterSpacing: '0.04em', textTransform: 'uppercase', background: iColor }}
          title={`Interest: ${interest}`}
        >
          {iShort}
        </div>
        <div
          className="lg-axis ethics"
          style={{ width: 'auto', padding: '0 8px', fontSize: 10, fontFamily: 'var(--mono)', fontStyle: 'normal', letterSpacing: '0.04em', textTransform: 'uppercase', background: eColor }}
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

import { CATEGORIES, interestRank, ethicsRank } from '@/lib/constants';
import { interestColor, ethicsColor } from '@/lib/dimensionColor';

interface GlyphBarsProps {
  interest: string;
  ethics: string;
  category: string;
}

type ColorFn = (rank: number, neutralRank: number, maxRank: number) => string;

function Bars({ rank, neutralRank, max, colorFn }: { rank: number; neutralRank: number; max: number; colorFn: ColorFn }) {
  return (
    <div className="bars">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className="bar"
          style={i === rank ? { background: colorFn(rank, neutralRank, max - 1) } : undefined}
        />
      ))}
    </div>
  );
}

export default function GlyphBars({ interest, ethics, category }: GlyphBarsProps) {
  const cat = CATEGORIES[category] ?? { label: category, hue: 60 };
  const iRank = interestRank(interest);
  const eRank = ethicsRank(ethics);
  const iNeutral = iRank === 1;
  const eNeutral = eRank === 2;
  return (
    <div className="glyph">
      <div className="cat-tag">
        <span className="swatch" style={{ background: `oklch(0.50 0.08 ${cat.hue})` }} />
        {cat.label}
      </div>
      {!iNeutral && (
        <div className="glyph-row" title={`Interest: ${interest}`}>
          <span className="axis-key">I</span>
          <Bars rank={iRank} neutralRank={1} max={5} colorFn={interestColor} />
          <span style={{ marginLeft: 4, color: interestColor(iRank, 1, 4), fontSize: 10 }}>{interest}</span>
        </div>
      )}
      {!eNeutral && (
        <div className="glyph-row" title={`Ethics: ${ethics}`}>
          <span className="axis-key">E</span>
          <Bars rank={eRank} neutralRank={2} max={5} colorFn={ethicsColor} />
          <span style={{ marginLeft: 4, color: ethicsColor(eRank, 2, 4), fontSize: 10 }}>{ethics}</span>
        </div>
      )}
    </div>
  );
}

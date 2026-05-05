'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

interface FirstVisitPopoverProps {
  onDismiss: () => void;
  onLearnMore: () => void;
}

export default function FirstVisitPopover({ onDismiss, onLearnMore }: FirstVisitPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onDismiss();
    };
    const t = setTimeout(() => document.addEventListener('pointerdown', onDown, true), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('pointerdown', onDown, true);
    };
  }, [onDismiss]);

  return (
    <div ref={ref} className="brand-popover" role="dialog" aria-label="Welcome to Discerned">
      <div className="brand-popover-arrow" />
      <div className="brand-popover-eyebrow">Welcome</div>
      <div className="brand-popover-title">Signal, <em>not noise.</em></div>
      <p className="brand-popover-lede">
        Discerned is a quiet protocol for thoughtful readers. Clip, rate across three axes,
        and broadcast — or don&apos;t.
      </p>
      <div className="brand-popover-actions">
        <button className="btn primary" onClick={onLearnMore}>Learn more →</button>
        <button className="btn ghost" onClick={onDismiss}>Got it</button>
      </div>
    </div>
  );
}

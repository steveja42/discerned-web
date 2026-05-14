'use client';

import { useRef, useCallback, useState, type ReactNode } from 'react';

interface ResizableLayoutProps {
  sidebar: ReactNode;
  feed: ReactNode;
  detail: ReactNode;
  showDetail?: boolean;
  initialSidebarWidth?: number;
}

const MIN_SIDEBAR = 160;
const MAX_SIDEBAR = 400;
const MIN_FEED = 280;
const MIN_DETAIL = 260;

export default function ResizableLayout({
  sidebar,
  feed,
  detail,
  showDetail = true,
  initialSidebarWidth = 200,
}: ResizableLayoutProps) {
  const [sidebarW, setSidebarW] = useState(initialSidebarWidth);
  // null = use CSS fr-based default; number = user has dragged, use px
  const [detailW, setDetailW] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startDrag = useCallback(
    (
      e: React.MouseEvent,
      setter: (w: number) => void,
      getNewWidth: (dx: number, containerW: number, currentW: number) => number,
    ) => {
      e.preventDefault();
      const startX = e.clientX;
      const containerW = containerRef.current?.offsetWidth ?? window.innerWidth;
      // If detail hasn't been dragged yet, measure its current rendered width
      const currentDetailW = detailW ?? (containerRef.current
        ? containerRef.current.offsetWidth - sidebarW - 8
        : 600);
      const currentW = setter === setSidebarW ? sidebarW : currentDetailW;

      const onMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startX;
        setter(getNewWidth(dx, containerW, currentW));
      };
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [sidebarW, detailW],
  );

  const dragSidebar = useCallback(
    (e: React.MouseEvent) => {
      startDrag(e, setSidebarW, (dx, _cw, cur) =>
        Math.max(MIN_SIDEBAR, Math.min(MAX_SIDEBAR, cur + dx)),
      );
    },
    [startDrag],
  );

  const dragDetail = useCallback(
    (e: React.MouseEvent) => {
      startDrag(e, setDetailW as (w: number) => void, (dx, cw, cur) => {
        const maxDetail = cw - sidebarW - MIN_FEED - 8;
        return Math.max(MIN_DETAIL, Math.min(maxDetail, cur - dx));
      });
    },
    [startDrag, sidebarW],
  );

  // When detailW is null, rely on CSS fr units (defined in .main) for the
  // detail column — no JS sizing, no flash. Once the user drags, switch to px.
  const columns = showDetail
    ? detailW !== null
      ? `${sidebarW}px 4px 1fr 4px ${detailW}px`
      : `${sidebarW}px 4px 1fr 4px 1.4fr`
    : `${sidebarW}px 4px 1fr`;

  return (
    <div
      ref={containerRef}
      className="main resizable-main"
      style={{ gridTemplateColumns: columns }}
    >
      {sidebar}

      <div
        className="col-resizer"
        onMouseDown={dragSidebar}
        title="Drag to resize"
      />

      {feed}

      {showDetail && (
        <>
          <div
            className="col-resizer"
            onMouseDown={dragDetail}
            title="Drag to resize"
          />
          {detail}
        </>
      )}
    </div>
  );
}

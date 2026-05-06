'use client';

import { useRef, useCallback, useEffect, useState, type ReactNode } from 'react';

interface ResizableLayoutProps {
  sidebar: ReactNode;
  feed: ReactNode;
  detail: ReactNode;
  /** Whether the detail panel is rendered (hidden on narrow viewports) */
  showDetail?: boolean;
  initialSidebarWidth?: number;
  initialDetailWidth?: number;
}

const MIN_SIDEBAR = 160;
const MAX_SIDEBAR = 400;
const MIN_FEED = 280;
const MIN_DETAIL = 260;
const MAX_DETAIL = 600;

export default function ResizableLayout({
  sidebar,
  feed,
  detail,
  showDetail = true,
  initialSidebarWidth = 200,
  initialDetailWidth = 320,
}: ResizableLayoutProps) {
  const [sidebarW, setSidebarW] = useState(initialSidebarWidth);
  const [detailW, setDetailW] = useState(initialDetailWidth);
  const containerRef = useRef<HTMLDivElement>(null);

  const startDrag = useCallback(
    (
      e: React.MouseEvent,
      setter: (w: number) => void,
      getNewWidth: (dx: number, containerW: number, currentW: number) => number,
    ) => {
      e.preventDefault();
      const startX = e.clientX;
      const containerW = containerRef.current?.offsetWidth ?? 1200;
      const currentW = setter === setSidebarW ? sidebarW : detailW;

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
      startDrag(e, setDetailW, (dx, _cw, cur) =>
        Math.max(MIN_DETAIL, Math.min(MAX_DETAIL, cur - dx)),
      );
    },
    [startDrag],
  );

  const columns = showDetail
    ? `${sidebarW}px 4px 1fr 4px ${detailW}px`
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

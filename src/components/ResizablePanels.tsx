"use client";

import {
  Children,
  Fragment,
  useCallback,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

/** Width of each drag handle, in pixels (matches the `w-1.5` class below). */
const HANDLE_PX = 6;
/** Percentage step when resizing with the arrow keys. */
const KEY_STEP = 2;

interface ResizablePanelsProps {
  children: React.ReactNode;
  /** Initial panel sizes as percentages (should sum to 100). */
  initialSizes: number[];
  /** Per-panel minimum sizes as percentages. */
  minSizes?: number[];
  className?: string;
}

/**
 * Horizontal split layout with draggable dividers between panels.
 *
 * Sizes are kept as percentages summing to 100 and applied via `flex-grow`
 * (with `flex-basis: 0`) so the fixed-width handles don't throw the math off.
 * Dragging a divider trades width between its two neighbours, clamped to their
 * minimum sizes. Supports pointer drag, keyboard arrows, and double-click reset.
 */
export default function ResizablePanels({
  children,
  initialSizes,
  minSizes,
  className = "",
}: ResizablePanelsProps) {
  const items = Children.toArray(children);
  const mins = minSizes ?? items.map(() => 10);

  const [sizes, setSizes] = useState<number[]>(initialSizes);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ index: number; startX: number; startSizes: number[] } | null>(
    null
  );

  /** Container width minus the handles — the space the panels actually share. */
  const availableWidth = useCallback(() => {
    const el = containerRef.current;
    if (!el) return 0;
    return el.clientWidth - (items.length - 1) * HANDLE_PX;
  }, [items.length]);

  /** Set the boundary `index` (between panel index and index+1) to a new split. */
  const applyBoundary = useCallback(
    (index: number, desiredLeft: number, base: number[]) => {
      const pairTotal = base[index] + base[index + 1];
      const left = Math.max(
        mins[index],
        Math.min(desiredLeft, pairTotal - mins[index + 1])
      );
      const next = [...base];
      next[index] = left;
      next[index + 1] = pairTotal - left;
      setSizes(next);
    },
    [mins]
  );

  const onPointerDown = (
    index: number,
    e: ReactPointerEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { index, startX: e.clientX, startSizes: [...sizes] };
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const avail = availableWidth();
    if (avail <= 0) return;
    const deltaPct = ((e.clientX - drag.startX) / avail) * 100;
    applyBoundary(drag.index, drag.startSizes[drag.index] + deltaPct, drag.startSizes);
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // pointer may already be released — ignore
    }
    dragRef.current = null;
    setDragging(false);
  };

  const onKeyDown = (index: number, e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      applyBoundary(index, sizes[index] - KEY_STEP, sizes);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      applyBoundary(index, sizes[index] + KEY_STEP, sizes);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`flex ${dragging ? "select-none" : ""} ${className}`}
    >
      {/* While dragging, an overlay keeps the col-resize cursor everywhere
          (incl. over Monaco). Pointer capture on the handle means this overlay
          never steals the drag events. */}
      {dragging && <div className="fixed inset-0 z-50 cursor-col-resize" />}

      {items.map((child, i) => (
        <Fragment key={i}>
          <div
            className="min-w-0 overflow-hidden"
            style={{ flexGrow: sizes[i], flexShrink: 1, flexBasis: 0 }}
          >
            {child}
          </div>

          {i < items.length - 1 && (
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize panels"
              tabIndex={0}
              onPointerDown={(e) => onPointerDown(i, e)}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onDoubleClick={() => setSizes(initialSizes)}
              onKeyDown={(e) => onKeyDown(i, e)}
              className="group relative w-1.5 shrink-0 cursor-col-resize touch-none select-none outline-none"
              title="Drag to resize (double-click to reset)"
            >
              <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-zinc-800 transition-colors group-hover:w-0.5 group-hover:bg-indigo-500 group-focus-visible:bg-indigo-500 group-active:w-0.5 group-active:bg-indigo-500" />
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
}

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

const HANDLE_PX = 6;
const KEY_STEP = 2;

type Direction = "horizontal" | "vertical";

interface ResizablePanelsProps {
  children: React.ReactNode;
  initialSizes: number[];
  minSizes?: number[];
  direction?: Direction;
  className?: string;
}

export default function ResizablePanels({
  children,
  initialSizes,
  minSizes,
  direction = "horizontal",
  className = "",
}: ResizablePanelsProps) {
  const items = Children.toArray(children);
  const mins = minSizes ?? items.map(() => 10);
  const isH = direction === "horizontal";

  const [sizes, setSizes] = useState<number[]>(initialSizes);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    index: number;
    start: number;
    startSizes: number[];
  } | null>(null);

  const availableSize = useCallback(() => {
    const el = containerRef.current;
    if (!el) return 0;
    const full = isH ? el.clientWidth : el.clientHeight;
    return full - (items.length - 1) * HANDLE_PX;
  }, [isH, items.length]);

  const applyBoundary = useCallback(
    (index: number, desiredFirst: number, base: number[]) => {
      const pairTotal = base[index] + base[index + 1];
      const first = Math.max(
        mins[index],
        Math.min(desiredFirst, pairTotal - mins[index + 1])
      );
      const next = [...base];
      next[index] = first;
      next[index + 1] = pairTotal - first;
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
    dragRef.current = {
      index,
      start: isH ? e.clientX : e.clientY,
      startSizes: [...sizes],
    };
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const avail = availableSize();
    if (avail <= 0) return;
    const pos = isH ? e.clientX : e.clientY;
    const deltaPct = ((pos - drag.start) / avail) * 100;
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
    const decrease = isH ? "ArrowLeft" : "ArrowUp";
    const increase = isH ? "ArrowRight" : "ArrowDown";
    if (e.key === decrease) {
      e.preventDefault();
      applyBoundary(index, sizes[index] - KEY_STEP, sizes);
    } else if (e.key === increase) {
      e.preventDefault();
      applyBoundary(index, sizes[index] + KEY_STEP, sizes);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`flex ${isH ? "flex-row" : "flex-col"} ${
        dragging ? "select-none" : ""
      } ${className}`}
    >
      {dragging && (
        <div
          className={`fixed inset-0 z-50 ${
            isH ? "cursor-col-resize" : "cursor-row-resize"
          }`}
        />
      )}

      {items.map((child, i) => (
        <Fragment key={i}>
          <div
            className={isH ? "min-w-0 overflow-hidden" : "min-h-0 overflow-hidden"}
            style={{ flexGrow: sizes[i], flexShrink: 1, flexBasis: 0 }}
          >
            {child}
          </div>

          {i < items.length - 1 && (
            <div
              role="separator"
              aria-orientation={isH ? "vertical" : "horizontal"}
              aria-label="Resize panels"
              tabIndex={0}
              onPointerDown={(e) => onPointerDown(i, e)}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onDoubleClick={() => setSizes(initialSizes)}
              onKeyDown={(e) => onKeyDown(i, e)}
              className={`group relative shrink-0 touch-none select-none outline-none ${
                isH ? "w-1.5 cursor-col-resize" : "h-1.5 cursor-row-resize"
              }`}
              title="Drag to resize (double-click to reset)"
            >
              <div
                className={`pointer-events-none absolute bg-zinc-800 transition-colors group-hover:bg-indigo-500 group-focus-visible:bg-indigo-500 group-active:bg-indigo-500 ${
                  isH
                    ? "inset-y-0 left-1/2 w-px -translate-x-1/2 group-hover:w-0.5 group-active:w-0.5"
                    : "inset-x-0 top-1/2 h-px -translate-y-1/2 group-hover:h-0.5 group-active:h-0.5"
                }`}
              />
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
}

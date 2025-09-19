import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  label: string;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
  className?: string;
};

const focusableSelector =
  [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");

function getFocusable(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  const all = Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelector)
  );
  // visible & enabled
  return all.filter(
    (el) =>
      el.tabIndex !== -1 &&
      !el.hasAttribute("disabled") &&
      el.offsetParent !== null
  );
}

/** Prevent background scroll while the sheet is open. */
function useScrollLock(locked: boolean) {
  useLayoutEffect(() => {
    if (!locked) return;
    const { body, documentElement } = document;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverscroll = documentElement.style.overscrollBehaviorY;

    body.style.overflow = "hidden";
    documentElement.style.overscrollBehaviorY = "contain";

    return () => {
      body.style.overflow = prevBodyOverflow;
      documentElement.style.overscrollBehaviorY = prevHtmlOverscroll;
    };
  }, [locked]);
}

export function BottomSheet({
  open,
  onClose,
  children,
  label,
  closeOnBackdrop = true,
  closeOnEsc = true,
  initialFocusRef,
  className,
}: BottomSheetProps) {
  const mounted = useRef(false);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const lastActiveEl = useRef<HTMLElement | null>(null);

  // gesture state
  const startY = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);
  const [animatingOut, setAnimatingOut] = useState(false);

  // portal root
  const [portalEl] = useState<HTMLDivElement | null>(() => {
    if (typeof document === "undefined") return null;
    const el = document.createElement("div");
    el.setAttribute("data-bottom-sheet-portal", "true");
    return el;
  });

  useEffect(() => {
    if (!portalEl) return;
    document.body.appendChild(portalEl);
    return () => {
      if (portalEl.parentNode) {
        portalEl.parentNode.removeChild(portalEl);
      }
    };
  }, [portalEl]);

  useScrollLock(open && !animatingOut);

  // focus management
  useEffect(() => {
    if (open) {
      mounted.current = true;
      lastActiveEl.current = (document.activeElement as HTMLElement) ?? null;

      const target: HTMLElement | null =
        initialFocusRef?.current ??
        getFocusable(sheetRef.current)[0] ??
        sheetRef.current;

      // let layout paint first
      requestAnimationFrame(() => {
        target?.focus?.();
      });
    } else if (mounted.current) {
      lastActiveEl.current?.focus?.();
      lastActiveEl.current = null;
      mounted.current = false;
    }
  }, [open, initialFocusRef]);

  // key handling (trap + esc)
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEsc) {
        e.stopPropagation();
        setAnimatingOut(true);
        setDragY(0);
        window.setTimeout(onClose, 180);
        return;
      }

      if (e.key !== "Tab") return;

      const container = sheetRef.current;
      if (!container) return;

      const focusables = getFocusable(container);
      if (focusables.length === 0) {
        e.preventDefault();
        container.focus();
        return;
      }

      const first: HTMLElement | undefined = focusables[0];
      const last: HTMLElement | undefined = focusables[focusables.length - 1];
      const active = (document.activeElement as HTMLElement | null) ?? null;

      // if active isn't inside, move to first to start the cycle
      if (!active || !container.contains(active)) {
        e.preventDefault();
        first?.focus();
        return;
      }

      if (e.shiftKey) {
        // Shift+Tab: wrap to last when at first
        if (active === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        // Tab forward: wrap to first when at last
        if (active === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    },
    [closeOnEsc, onClose]
  );

  // backdrop click (only when the actual backdrop is hit)
  const onBackdropMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!closeOnBackdrop) return;
      const target = e.target;
      if (target instanceof HTMLDivElement && target === backdropRef.current) {
        setAnimatingOut(true);
        setDragY(0);
        window.setTimeout(onClose, 180);
      }
    },
    [closeOnBackdrop, onClose]
  );

  // drag-to-dismiss (vertical)
  const onTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const t0 = e.touches && e.touches.length > 0 ? e.touches[0] : null;
    if (!t0) return;
    startY.current = t0.clientY;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (startY.current == null) return;
    const t0 = e.touches && e.touches.length > 0 ? e.touches[0] : null;
    if (!t0) return;
    const dy = t0.clientY - startY.current;
    setDragY(dy > 0 ? dy : Math.max(dy, -8));
  }, []);

  const onTouchEnd = useCallback(() => {
    if (startY.current == null) return;
    const threshold = 64;
    if (dragY > threshold) {
      setAnimatingOut(true);
      setDragY(0);
      window.setTimeout(onClose, 180);
    } else {
      setDragY(0);
    }
    startY.current = null;
  }, [dragY, onClose]);

  if (!open || !portalEl) return null;

  const dragStyle: React.CSSProperties | undefined =
    dragY !== 0 ? { transform: `translateY(${Math.max(0, dragY)}px)` } : undefined;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-40"
      onKeyDown={onKeyDown}
    >
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity duration-200"
        onMouseDown={onBackdropMouseDown}
      />

      {/* Sheet */}
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-md p-4">
        <div
          ref={sheetRef}
          tabIndex={-1}
          className={[
            "rounded-3xl border border-neutral-200 dark:border-neutral-800",
            "bg-white dark:bg-neutral-900 shadow-2xl",
            "transition-transform duration-200 motion-reduce:transition-none",
            "pb-[max(env(safe-area-inset-bottom),1rem)] pt-2 px-4",
            "translate-y-0",
            className ?? "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={dragStyle}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="mx-auto my-2 h-1.5 w-10 rounded-full bg-neutral-300/90 dark:bg-neutral-700/90" />
          <div className="pb-2">{children}</div>
        </div>
      </div>
    </div>,
    portalEl
  );
}

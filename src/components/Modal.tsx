import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Short, descriptive label announced by screen readers. */
  label: string;

  /** Defaults: true */
  closeOnBackdrop?: boolean;
  /** Defaults: true */
  closeOnEsc?: boolean;

  /** Focus this element first when opening (falls back to first focusable, then panel). */
  initialFocusRef?: React.RefObject<HTMLElement>;
  /** Extra classes for the panel (rounded card). */
  className?: string;
};

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getFocusable(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  const all = Array.from(container.querySelectorAll<HTMLElement>(focusableSelector));
  return all.filter(
    (el) =>
      el.tabIndex !== -1 &&
      !el.hasAttribute("disabled") &&
      el.offsetParent !== null
  );
}

/** Prevent background scroll while the modal is open. */
function useScrollLock(locked: boolean) {
  useLayoutEffect(() => {
    if (!locked) return;
    const { body, documentElement } = document;
    const prevOverflow = body.style.overflow;
    const prevOverscroll = documentElement.style.overscrollBehaviorY;

    body.style.overflow = "hidden";
    documentElement.style.overscrollBehaviorY = "contain";

    return () => {
      body.style.overflow = prevOverflow;
      documentElement.style.overscrollBehaviorY = prevOverscroll;
    };
  }, [locked]);
}

export function Modal({
  open,
  onClose,
  children,
  label,
  closeOnBackdrop = true,
  closeOnEsc = true,
  initialFocusRef,
  className,
}: ModalProps) {
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const lastActiveEl = useRef<HTMLElement | null>(null);
  const [animOut, setAnimOut] = useState(false);

  // Portal root (once)
  const [portalEl] = useState<HTMLDivElement | null>(() => {
    if (typeof document === "undefined") return null;
    const el = document.createElement("div");
    el.setAttribute("data-modal-portal", "true");
    return el;
  });

  useEffect(() => {
    if (!portalEl) return;
    document.body.appendChild(portalEl);
    return () => {
      if (portalEl.parentNode) portalEl.parentNode.removeChild(portalEl);
    };
  }, [portalEl]);

  // Lock page scroll when open (and not animating out)
  useScrollLock(open && !animOut);

  // Manage focus in/out
  useEffect(() => {
    if (open) {
      lastActiveEl.current = (document.activeElement as HTMLElement) ?? null;
      const target: HTMLElement | null =
        initialFocusRef?.current ??
        getFocusable(panelRef.current)[0] ??
        panelRef.current;

      // Wait a frame to ensure the panel is painted
      requestAnimationFrame(() => target?.focus?.());
    } else {
      // restore focus politely
      lastActiveEl.current?.focus?.();
      lastActiveEl.current = null;
    }
  }, [open, initialFocusRef]);

  // Keyboard handling: trap focus & Escape
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEsc) {
        e.stopPropagation();
        setAnimOut(true);
        window.setTimeout(onClose, 180);
        return;
      }
      if (e.key !== "Tab") return;

      const container = panelRef.current;
      if (!container) return;

      const focusables = getFocusable(container);
      if (focusables.length === 0) {
        e.preventDefault();
        container.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = (document.activeElement as HTMLElement | null) ?? null;

      if (!active || !container.contains(active)) {
        e.preventDefault();
        first?.focus();
        return;
      }

      if (e.shiftKey) {
        if (active === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    },
    [closeOnEsc, onClose]
  );

  // Backdrop click (only when clicking the actual backdrop)
  const onBackdropMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!closeOnBackdrop) return;
      const target = e.target;
      if (target instanceof HTMLDivElement && target === backdropRef.current) {
        setAnimOut(true);
        window.setTimeout(onClose, 180);
      }
    },
    [closeOnBackdrop, onClose]
  );

  if (!open || !portalEl) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-50"
      onKeyDown={onKeyDown}
    >
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className={[
          "absolute inset-0 bg-black/40 backdrop-blur-[1px]",
          "transition-opacity duration-200 motion-reduce:transition-none",
          animOut ? "opacity-0" : "opacity-100",
        ].join(" ")}
        onMouseDown={onBackdropMouseDown}
      />

      {/* Centering grid */}
      <div className="absolute inset-0 grid place-items-center p-4">
        {/* Panel */}
        <div
          ref={panelRef}
          tabIndex={-1}
          className={[
            "w-full max-w-md rounded-3xl border border-neutral-200 dark:border-neutral-800",
            "bg-white dark:bg-neutral-900 shadow-2xl outline-none",
            // motion (scale & fade)
            "transition-all duration-200 motion-reduce:transition-none",
            animOut ? "opacity-0 scale-95" : "opacity-100 scale-100",
            "p-4",
            className ?? "",
          ].join(" ")}
        >
          {children}
        </div>
      </div>
    </div>,
    portalEl
  );
}

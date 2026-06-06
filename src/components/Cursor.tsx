import { useEffect, useRef, useState } from "react";

type Pos = { x: number; y: number } | null;

export function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Pos>(null);
  const posRef = useRef<Pos>(null);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);

  // Mount listeners ONCE
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let raf = 0;
    const target = { x: 0, y: 0 };
    const ring = { x: 0, y: 0 };
    let initialized = false;

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!initialized) {
        ring.x = target.x;
        ring.y = target.y;
        initialized = true;
        posRef.current = { x: target.x, y: target.y };
        setPos({ x: target.x, y: target.y });
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${target.x - 2}px, ${target.y - 2}px, 0)`;
      }
      const el = e.target as HTMLElement | null;
      const interactive = !!el?.closest(
        "a, button, [role='button'], input, textarea, select, label, .magnetic",
      );
      setHovering(interactive);
    };

    const onDown = () => setClicking(true);
    const onUp = () => setClicking(false);

    const tick = () => {
      if (initialized) {
        ring.x += (target.x - ring.x) * 0.18;
        ring.y += (target.y - ring.y) * 0.18;
        if (ringRef.current) {
          ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  if (!pos) return null;

  const size = hovering ? 40 : 12;
  const borderColor = clicking ? "#F43F5E" : hovering ? "#22D3EE" : "#A855F7";

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: size,
          height: size,
          borderRadius: "50%",
          border: `2px solid ${borderColor}`,
          background: hovering ? "rgba(34, 211, 238, 0.10)" : "transparent",
          pointerEvents: "none",
          zIndex: 99999,
          transition:
            "width 250ms cubic-bezier(0.16,1,0.3,1), height 250ms cubic-bezier(0.16,1,0.3,1), border-color 200ms ease, background-color 200ms ease",
          willChange: "transform",
          mixBlendMode: "difference",
        }}
      />
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: "#A855F7",
          pointerEvents: "none",
          zIndex: 99999,
          opacity: hovering ? 0 : 1,
          transition: "opacity 200ms ease",
          willChange: "transform",
        }}
      />
    </>
  );
}

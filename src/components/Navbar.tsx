import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { easeExpo } from "@/lib/motion";

const NAV = [
  { to: "/", label: "Index" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/new", label: "New App" },
  { to: "/settings", label: "Settings" },
] as const;

export function Navbar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: easeExpo, delay: 0.1 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? "rgba(5, 5, 15, 0.8)" : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(160%)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "1px solid transparent",
        transition: "all 400ms ease",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-3">
          <div className="relative h-7 w-7">
            <div
              className="absolute inset-0 rounded-md"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
                boxShadow: "0 0 24px rgba(124,58,237,0.5)",
              }}
            />
            <div className="absolute inset-[3px] rounded-[4px]" style={{ background: "#05050F" }} />
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "1.1rem",
              letterSpacing: "0.1em",
            }}
          >
            FORGE<span style={{ color: "var(--forge-violet-bright)" }}>AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => {
            const active = item.to === "/" ? path === "/" : path.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to} className="relative">
                <span
                  className="nav-link"
                  style={{
                    color: active ? "var(--forge-text)" : "var(--forge-text-secondary)",
                  }}
                >
                  {item.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    transition={{ duration: 0.5, ease: easeExpo }}
                    style={{
                      position: "absolute",
                      left: -10,
                      top: "50%",
                      width: 4,
                      height: 4,
                      marginTop: -2,
                      borderRadius: "50%",
                      background: "var(--forge-violet-bright)",
                      boxShadow: "0 0 12px var(--forge-violet-bright)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <Link to="/auth" className="btn-forge !py-2 !px-5 !text-xs">
          Sign In
        </Link>
      </div>
    </motion.header>
  );
}

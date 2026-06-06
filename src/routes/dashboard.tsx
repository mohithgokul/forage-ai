import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { lazy, Suspense } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ClientOnly } from "@/components/ClientOnly";
import { cardGridContainer, cardGridItem, easeExpo } from "@/lib/motion";

const DashboardScene = lazy(() => import("@/components/three/DashboardScene"));

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — FORGEAI" },
      { name: "description", content: "Your forged applications." },
      { property: "og:title", content: "Dashboard — FORGEAI" },
      { property: "og:description", content: "Your forged applications." },
    ],
  }),
  component: DashboardPage,
});

const APPS = [
  { id: "atlas", name: "Atlas CRM", status: "live", color: "var(--forge-violet-bright)" },
  { id: "kepler", name: "Kepler Analytics", status: "building", color: "var(--forge-cyan-bright)" },
  { id: "vesper", name: "Vesper Inbox", status: "live", color: "var(--forge-coral-bright)" },
  { id: "orion", name: "Orion Docs", status: "draft", color: "var(--forge-gold-bright)" },
];

function DashboardPage() {
  return (
    <main style={{ minHeight: "100vh", paddingTop: 96 }}>
      <Sidebar />
      <div style={{ marginLeft: 288, paddingRight: 32, paddingBottom: 64 }}>
        <div className="flex items-start justify-between gap-8 mb-12">
          <div>
            <div className="eyebrow">// dashboard</div>
            <h1 className="display-xl mt-2" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
              Your forge.
            </h1>
            <p className="mt-3 text-base" style={{ color: "var(--forge-text-secondary)" }}>
              4 active applications. 1 building.
            </p>
          </div>
          <ClientOnly>
            <div className="flex flex-col items-end gap-2">
              <Suspense fallback={<div className="skeleton" style={{ width: 280, height: 280 }} />}>
                <DashboardScene />
              </Suspense>
              <div className="eyebrow" style={{ fontSize: "0.65rem" }}>
                // forge engine active
              </div>
            </div>
          </ClientOnly>
        </div>

        {/* Stats */}
        <motion.div
          variants={cardGridContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-10"
        >
          {[
            { l: "Apps built", v: "12" },
            { l: "Deployments", v: "48" },
            { l: "Prompts", v: "317" },
            { l: "Tokens / mo", v: "1.2M" },
          ].map((s) => (
            <motion.div key={s.l} variants={cardGridItem} className="glass-card p-5">
              <div className="eyebrow" style={{ fontSize: "0.65rem" }}>
                // {s.l}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "2rem",
                  marginTop: 6,
                }}
                className="text-gradient-violet-cyan"
              >
                {s.v}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* App grid */}
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem" }}>Apps</h2>
          <Link to="/new" className="btn-forge !py-2 !px-4 !text-xs">
            + New app
          </Link>
        </div>

        <motion.div
          variants={cardGridContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {APPS.map((app) => (
            <motion.div
              key={app.id}
              variants={cardGridItem}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3, ease: easeExpo }}
              className="glass-card p-6 relative"
            >
              {/* Corner brackets */}
              {[
                { top: 8, left: 8 },
                { top: 8, right: 8 },
                { bottom: 8, left: 8 },
                { bottom: 8, right: 8 },
              ].map((pos, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    width: 10,
                    height: 10,
                    border: `1px solid ${app.color}`,
                    borderTop: pos.top !== undefined ? `1px solid ${app.color}` : "none",
                    borderBottom: pos.bottom !== undefined ? `1px solid ${app.color}` : "none",
                    borderLeft: pos.left !== undefined ? `1px solid ${app.color}` : "none",
                    borderRight: pos.right !== undefined ? `1px solid ${app.color}` : "none",
                    opacity: 0.5,
                    ...pos,
                  }}
                />
              ))}
              <Link to="/apps/$id" params={{ id: app.id }} className="block">
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: app.color,
                    boxShadow: `0 0 24px ${app.color}`,
                    marginBottom: 16,
                  }}
                />
                <div className="flex items-center justify-between">
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.25rem",
                      fontWeight: 700,
                    }}
                  >
                    {app.name}
                  </h3>
                  <span className="eyebrow" style={{ fontSize: "0.6rem", color: app.color }}>
                    {app.status}
                  </span>
                </div>
                <p className="mt-2 text-xs" style={{ color: "var(--forge-text-muted)" }}>
                  forge.ai/{app.id}
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}

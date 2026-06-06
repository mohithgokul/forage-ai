import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { lazy, Suspense, useRef } from "react";
import { MessageSquare, FileJson, Rocket, ArrowRight } from "lucide-react";
import { ClientOnly } from "@/components/ClientOnly";
import { easeExpo } from "@/lib/motion";

const LandingScene = lazy(() => import("@/components/three/LandingScene"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FORGEAI — Generate apps with a single prompt" },
      { name: "description", content: "An AI-powered app generator for designers and engineers." },
      { property: "og:title", content: "FORGEAI" },
      {
        property: "og:description",
        content: "An AI-powered app generator for designers and engineers.",
      },
    ],
  }),
  component: LandingPage,
});

function SplitHeadline({ text, baseDelay = 0 }: { text: string; baseDelay?: number }) {
  return (
    <h1 className="display-xl">
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "tween",
            duration: 0.8,
            ease: easeExpo,
            delay: baseDelay + i * 0.04,
          }}
          style={{ display: "inline-block", whiteSpace: "pre", willChange: "transform" }}
        >
          {ch}
        </motion.span>
      ))}
    </h1>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Describe your app",
    body: "Type what you want in plain English. No technical knowledge needed. Our AI understands what you mean.",
    color: "var(--forge-violet-bright)",
    Icon: MessageSquare,
  },
  {
    n: "02",
    title: "Review the blueprint",
    body: "ForgeAI generates a live config showing your tables, fields, relationships, and UI layout. Edit anything before building.",
    color: "var(--forge-cyan-bright)",
    Icon: FileJson,
  },
  {
    n: "03",
    title: "Your app goes live",
    body: "We build the database, APIs, and frontend automatically. Import CSV data, export to GitHub, set up automations — all from one place.",
    color: "var(--forge-coral-bright)",
    Icon: Rocket,
  },
];

function LandingPage() {
  const { scrollY } = useScroll();
  const rawY = useTransform(scrollY, [0, 1200], [0, -400]);
  const sceneY = useSpring(rawY, { stiffness: 60, damping: 20 });

  return (
    <main className="relative">
      <ClientOnly>
        <motion.div
          style={{ y: sceneY, position: "fixed", inset: 0, zIndex: 0, willChange: "transform" }}
        >
          <Suspense fallback={null}>
            <LandingScene />
          </Suspense>
        </motion.div>
      </ClientOnly>

      {/* HERO */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 mx-auto flex max-w-7xl flex-col items-start justify-center px-6 pt-44 pb-32"
        style={{ minHeight: "100vh", willChange: "transform" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeExpo, delay: 0.1 }}
          className="eyebrow mb-6"
        >
          // v1.0 — generative app forge
        </motion.div>
        <div className="max-w-4xl">
          <SplitHeadline text="Build apps" baseDelay={0.3} />
          <div className="display-xl">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: easeExpo, delay: 0.7 }}
              className="text-gradient-violet-cyan inline-block"
            >
              at the speed
            </motion.span>
          </div>
          <SplitHeadline text="of thought." baseDelay={1.0} />
        </div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeExpo, delay: 1.4 }}
          className="mt-8 max-w-xl text-base"
          style={{ color: "var(--forge-text-secondary)", lineHeight: 1.7 }}
        >
          FORGEAI compiles your prompt into a fully wired, deployable application. Database, auth,
          UI, server — assembled in seconds.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeExpo, delay: 1.55 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Link to="/new" className="btn-forge">
            Start forging →
          </Link>
          <Link to="/dashboard" className="btn-ghost">
            View dashboard
          </Link>
        </motion.div>
      </motion.section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.75, ease: easeExpo }}
          className="mb-16"
          style={{ willChange: "transform" }}
        >
          <div className="eyebrow">// how it works</div>
          <h2 className="display-xl mt-3" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
            Three steps. One app.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.75, ease: easeExpo, delay: i * 0.15 }}
              className="glass-card relative p-7"
              style={{ willChange: "transform" }}
            >
              {/* Corner brackets */}
              {[
                {
                  top: 8,
                  left: 8,
                  borderTop: `1px solid ${s.color}`,
                  borderLeft: `1px solid ${s.color}`,
                },
                {
                  top: 8,
                  right: 8,
                  borderTop: `1px solid ${s.color}`,
                  borderRight: `1px solid ${s.color}`,
                },
                {
                  bottom: 8,
                  left: 8,
                  borderBottom: `1px solid ${s.color}`,
                  borderLeft: `1px solid ${s.color}`,
                },
                {
                  bottom: 8,
                  right: 8,
                  borderBottom: `1px solid ${s.color}`,
                  borderRight: `1px solid ${s.color}`,
                },
              ].map((p, j) => (
                <div
                  key={j}
                  style={{ position: "absolute", width: 12, height: 12, opacity: 0.55, ...p }}
                />
              ))}

              <div className="flex items-center justify-between">
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 48,
                    color: s.color,
                    textShadow: `0 0 32px ${s.color}`,
                    lineHeight: 1,
                  }}
                >
                  {s.n}
                </div>
                <s.Icon size={28} color={s.color} strokeWidth={1.5} />
              </div>
              <div className="eyebrow mt-4" style={{ fontSize: "0.65rem" }}>
                // step {s.n}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 20,
                  color: "var(--forge-text)",
                  marginTop: 8,
                }}
              >
                {s.title}
              </h3>
              <p
                className="mt-3 text-sm"
                style={{ color: "var(--forge-text-secondary)", lineHeight: 1.6 }}
              >
                {s.body}
              </p>
              {i < STEPS.length - 1 && (
                <motion.div
                  animate={{ x: [0, 6, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  className="mt-6 hidden md:flex items-center justify-end"
                  style={{ color: s.color }}
                >
                  <ArrowRight size={20} />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* PIPELINE DEMO */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.75, ease: easeExpo }}
          className="mb-16"
          style={{ willChange: "transform" }}
        >
          <div className="eyebrow">// 02 — pipeline</div>
          <h2 className="display-xl mt-3" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
            Prompt in. App out.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.75, ease: easeExpo }}
            className="glass-card p-8"
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", willChange: "transform" }}
          >
            <div className="eyebrow mb-4">// prompt.txt</div>
            <div style={{ color: "var(--forge-cyan-bright)" }}>$ forge new</div>
            <div className="mt-2" style={{ color: "var(--forge-text)" }}>
              &gt; Build me a CRM with leads, deals,
              <br />
              &nbsp;&nbsp;and an inbox view. Use Postgres.
            </div>
            <div className="mt-4" style={{ color: "var(--forge-violet-bright)" }}>
              ✓ schema generated
              <br />
              ✓ routes wired
              <br />✓ ui composed
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.75, ease: easeExpo, delay: 0.15 }}
            className="glass-card p-8"
            style={{ willChange: "transform" }}
          >
            <div className="eyebrow mb-4">// preview.app</div>
            <div className="space-y-3">
              {["Leads", "Deals", "Inbox"].map((t) => (
                <div
                  key={t}
                  className="flex items-center justify-between rounded-lg p-3"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <span style={{ color: "var(--forge-text)" }}>{t}</span>
                  <span style={{ color: "var(--forge-cyan-bright)", fontSize: "0.75rem" }}>
                    live
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.75, ease: easeExpo }}
          className="mb-16"
          style={{ willChange: "transform" }}
        >
          <div className="eyebrow">// 03 — capabilities</div>
          <h2 className="display-xl mt-3" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
            The full stack, forged.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              t: "CSV → Schema",
              d: "Drop a CSV. Get a typed table with indexes and RLS.",
              c: "var(--forge-violet-bright)",
            },
            {
              t: "GitHub Export",
              d: "One click to ship a clean repo with deploy-ready CI.",
              c: "var(--forge-cyan-bright)",
            },
            {
              t: "Live Build",
              d: "Watch your app assemble in real time with traceable steps.",
              c: "var(--forge-coral-bright)",
            },
            {
              t: "Edge Functions",
              d: "Server logic baked in. Zero-config edge deployments.",
              c: "var(--forge-gold-bright)",
            },
            {
              t: "Auth Built-in",
              d: "OAuth, magic links, sessions — wired without thinking.",
              c: "var(--forge-violet-bright)",
            },
            {
              t: "Iterate Forever",
              d: "Re-prompt to refine. Diffs preview before they apply.",
              c: "var(--forge-cyan-bright)",
            },
          ].map((f, i) => (
            <motion.div
              key={f.t}
              initial={{ opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.75, ease: easeExpo, delay: (i % 3) * 0.1 }}
              whileHover={{ y: -8 }}
              className="glass-card p-6"
              style={{ willChange: "transform" }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: f.c,
                  boxShadow: `0 0 24px ${f.c}`,
                  marginBottom: 16,
                }}
              />
              <h3
                style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 700 }}
              >
                {f.t}
              </h3>
              <p
                className="mt-2 text-sm"
                style={{ color: "var(--forge-text-secondary)", lineHeight: 1.6 }}
              >
                {f.d}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 48 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.75, ease: easeExpo }}
        className="relative z-10 mx-auto max-w-7xl px-6 py-32"
        style={{ willChange: "transform" }}
      >
        <div className="glass-card p-16 text-center">
          <div className="eyebrow">// ready</div>
          <h2 className="display-xl mt-3" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
            <span className="text-gradient-violet-cyan">Forge your first app.</span>
          </h2>
          <div className="mt-8">
            <Link to="/new" className="btn-forge">
              Start forging →
            </Link>
          </div>
        </div>
      </motion.section>

      <footer className="relative z-10 mx-auto max-w-7xl px-6 py-12 text-center">
        <p className="eyebrow">© FORGEAI — Made in the void</p>
      </footer>
    </main>
  );
}

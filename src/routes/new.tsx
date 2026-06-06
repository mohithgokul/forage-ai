import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { lazy, Suspense, useEffect, useState } from "react";
import { ClientOnly } from "@/components/ClientOnly";
import { easeExpo } from "@/lib/motion";

const BuildScene = lazy(() => import("@/components/three/BuildScene"));

export const Route = createFileRoute("/new")({
  head: () => ({
    meta: [
      { title: "New app — FORGEAI" },
      { name: "description", content: "Forge a new application from a prompt." },
      { property: "og:title", content: "New app — FORGEAI" },
      { property: "og:description", content: "Forge a new application from a prompt." },
    ],
  }),
  component: NewAppPage,
});

const STEPS = [
  "Parsing prompt",
  "Designing schema",
  "Generating routes",
  "Composing UI",
  "Wiring server logic",
  "Deploying preview",
];

function NewAppPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [prompt, setPrompt] = useState("");
  const [completed, setCompleted] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    if (step !== 3) return;
    if (completed >= STEPS.length) return;
    const t = setTimeout(() => {
      setCompleted((c) => c + 1);
      setActiveIdx((i) => Math.min(i + 1, STEPS.length - 1));
    }, 900);
    return () => clearTimeout(t);
  }, [step, completed]);

  useEffect(() => {
    if (completed === STEPS.length) {
      setBurst(true);
      const t = setTimeout(() => navigate({ to: "/apps/$id", params: { id: "atlas" } }), 1600);
      return () => clearTimeout(t);
    }
  }, [completed, navigate]);

  return (
    <main className="relative" style={{ minHeight: "100vh", paddingTop: 120 }}>
      {step === 3 && (
        <ClientOnly>
          <Suspense fallback={null}>
            <BuildScene totalSteps={STEPS.length} completed={completed} />
          </Suspense>
        </ClientOnly>
      )}

      <div className="relative z-10 mx-auto max-w-3xl px-6 pb-24">
        <div className="eyebrow mb-3">// step {step} of 3</div>
        <h1 className="display-xl" style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)" }}>
          {step === 1 && "What are we forging?"}
          {step === 2 && "Confirm the blueprint."}
          {step === 3 && (burst ? "Forge complete." : "Forging…")}
        </h1>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: easeExpo }}
              className="mt-8"
            >
              <div className="glass-card p-6">
                <label className="eyebrow mb-3 block">// prompt</label>
                <textarea
                  className="input-forge"
                  rows={5}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A CRM with leads, deals and a Kanban board…"
                />
                <button
                  onClick={() => setStep(2)}
                  disabled={prompt.trim().length < 4}
                  className="btn-forge mt-5 w-full disabled:opacity-40"
                >
                  Continue →
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="s2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: easeExpo }}
              className="mt-8 glass-card p-6"
            >
              <div className="eyebrow mb-3">// blueprint</div>
              <p style={{ color: "var(--forge-text)", lineHeight: 1.7 }}>{prompt}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {["Database", "Auth", "UI", "Server"].map((t) => (
                  <div
                    key={t}
                    className="rounded-md px-3 py-2 text-xs"
                    style={{
                      border: "1px solid rgba(168,85,247,0.2)",
                      background: "rgba(124,58,237,0.06)",
                      color: "var(--forge-violet-bright)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    ✓ {t}
                  </div>
                ))}
              </div>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setStep(1)} className="btn-ghost">
                  Back
                </button>
                <button onClick={() => setStep(3)} className="btn-forge flex-1">
                  Begin forge →
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="s3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="mt-10 glass-card p-6 relative overflow-hidden"
            >
              <div className="eyebrow mb-4">// build log</div>
              <ul className="flex flex-col gap-3">
                <AnimatePresence>
                  {STEPS.slice(0, Math.min(activeIdx + 1, STEPS.length)).map((label, i) => {
                    const isDone = i < completed;
                    const isActive = i === completed;
                    return (
                      <motion.li
                        key={label}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, ease: easeExpo }}
                        className="flex items-center gap-3"
                      >
                        <div style={{ width: 24, position: "relative" }}>
                          <AnimatePresence mode="wait">
                            {isDone ? (
                              <motion.span
                                key="done"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                style={{ color: "var(--forge-violet-bright)" }}
                              >
                                ✓
                              </motion.span>
                            ) : isActive ? (
                              <motion.span
                                key="active"
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                style={{
                                  color: "var(--forge-cyan-bright)",
                                  display: "inline-block",
                                }}
                              >
                                ●
                              </motion.span>
                            ) : (
                              <span style={{ color: "var(--forge-text-muted)" }}>○</span>
                            )}
                          </AnimatePresence>
                        </div>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.9rem",
                            color: isDone
                              ? "var(--forge-text)"
                              : isActive
                                ? "var(--forge-cyan-bright)"
                                : "var(--forge-text-muted)",
                          }}
                        >
                          {label}
                        </span>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>

              {burst && (
                <motion.div
                  initial={{ scale: 0, opacity: 0.6 }}
                  animate={{ scale: 4, opacity: 0 }}
                  transition={{ duration: 0.6, ease: easeExpo }}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: 100,
                    height: 100,
                    marginLeft: -50,
                    marginTop: -50,
                    borderRadius: "50%",
                    background: "#7C3AED",
                    boxShadow: "0 0 60px #7C3AED",
                    pointerEvents: "none",
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

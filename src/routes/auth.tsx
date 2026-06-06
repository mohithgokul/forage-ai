import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { lazy, Suspense, useState } from "react";
import { ClientOnly } from "@/components/ClientOnly";
import { easeExpo } from "@/lib/motion";

const AuthScene = lazy(() => import("@/components/three/AuthScene"));

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — FORGEAI" },
      { name: "description", content: "Access the forge." },
      { property: "og:title", content: "Sign in — FORGEAI" },
      { property: "og:description", content: "Access the forge." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <main className="relative" style={{ minHeight: "100vh" }}>
      <ClientOnly>
        <Suspense fallback={null}>
          <AuthScene />
        </Suspense>
      </ClientOnly>

      <div
        className="relative flex items-center justify-center px-4"
        style={{ minHeight: "100vh", zIndex: 10 }}
      >
        <motion.div
          animate={{ y: [-6, 6, -6] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 420,
            maxWidth: "100%",
            padding: 36,
            borderRadius: 20,
            background: "rgba(8, 8, 24, 0.7)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            boxShadow: "0 0 60px rgba(124, 58, 237, 0.2), 0 0 120px rgba(124, 58, 237, 0.1)",
          }}
        >
          <div className="eyebrow">// {mode === "signin" ? "access" : "register"}</div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "2rem",
              marginTop: 8,
              letterSpacing: "-0.02em",
            }}
          >
            {mode === "signin" ? "Re-enter the forge." : "Forge your account."}
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--forge-text-secondary)" }}>
            {mode === "signin" ? "Welcome back, operator." : "Join the generative layer."}
          </p>

          <form
            className="mt-7 flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/dashboard" });
            }}
          >
            {mode === "signup" && (
              <div>
                <label className="eyebrow mb-2 block">// name</label>
                <input className="input-forge" placeholder="Ada Lovelace" />
              </div>
            )}
            <div>
              <label className="eyebrow mb-2 block">// email</label>
              <input className="input-forge" type="email" placeholder="you@forge.ai" />
            </div>
            <div>
              <label className="eyebrow mb-2 block">// password</label>
              <input className="input-forge" type="password" placeholder="••••••••" />
            </div>

            <button type="submit" className="btn-forge mt-2 w-full">
              {mode === "signin" ? "Enter" : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs" style={{ color: "var(--forge-text-muted)" }}>
            {mode === "signin" ? "No account?" : "Have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              style={{ color: "var(--forge-cyan-bright)", background: "none", border: "none" }}
              className="nav-link !text-xs"
            >
              {mode === "signin" ? "Register" : "Sign in"}
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

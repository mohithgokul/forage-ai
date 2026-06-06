import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Sparkles,
  Upload,
  Github,
  Zap,
  Eye,
  Settings as SettingsIcon,
  Table as TableIcon,
  FormInput,
  LayoutDashboard,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Pencil,
  Trash2,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { CSVImportModal } from "@/components/modals/CSVImportModal";
import { GitHubExportModal } from "@/components/modals/GitHubExportModal";
import { easeExpo } from "@/lib/motion";

export const Route = createFileRoute("/apps/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.id} — FORGEAI` },
      { name: "description", content: `Inspect and iterate on ${params.id}.` },
      { property: "og:title", content: `${params.id} — FORGEAI` },
      { property: "og:description", content: `Inspect and iterate on ${params.id}.` },
    ],
  }),
  component: AppPage,
});

const ACTIONS = [
  {
    Icon: Sparkles,
    label: "AI PROMPT",
    color: "var(--forge-violet-bright)",
    tip: "Refine your app with natural language",
  },
  {
    Icon: Upload,
    label: "IMPORT CSV",
    color: "var(--forge-cyan-bright)",
    tip: "Bulk-import data from a spreadsheet",
    action: "csv" as const,
  },
  {
    Icon: Github,
    label: "GITHUB EXPORT",
    color: "#F1F0FF",
    tip: "Download a ready-to-deploy repo",
    action: "gh" as const,
  },
  {
    Icon: Zap,
    label: "AUTOMATIONS",
    color: "var(--forge-gold-bright)",
    tip: "Trigger workflows on events",
  },
  {
    Icon: Eye,
    label: "PREVIEW APP",
    color: "var(--forge-coral-bright)",
    tip: "Open the live preview",
  },
  { Icon: SettingsIcon, label: "APP SETTINGS", color: "#8B8BAA", tip: "App-wide configuration" },
];

const VIEWS = [
  { name: "Contacts", type: "table", Icon: TableIcon, count: 247 },
  { name: "Deals", type: "table", Icon: TableIcon, count: 38 },
  { name: "New Contact", type: "form", Icon: FormInput, count: 0 },
  { name: "Overview", type: "dashboard", Icon: LayoutDashboard, count: 0 },
];

const FIELDS = ["name", "email", "company", "phone", "stage"];

const ROWS = Array.from({ length: 8 }).map((_, i) => ({
  name: [
    "Ada Lovelace",
    "Grace Hopper",
    "Linus Torvalds",
    "Margaret Hamilton",
    "Alan Turing",
    "Katherine Johnson",
    "Dennis Ritchie",
    "Radia Perlman",
  ][i],
  email: [
    "ada@analytical.engine",
    "grace@navy.mil",
    "linus@kernel.org",
    "m.hamilton@apollo.gov",
    "alan@bletchley.uk",
    "k.johnson@nasa.gov",
    "dmr@bell-labs.com",
    "radia@mit.edu",
  ][i],
  company: ["Babbage Ltd", "USN", "Linux Foundation", "NASA", "GC&CS", "NASA", "Bell Labs", "MIT"][
    i
  ],
  phone: "+1 555 0" + (100 + i),
  stage: ["Lead", "Qualified", "Demo", "Closed", "Lead", "Demo", "Qualified", "Lead"][i],
}));

function AppPage() {
  const { id } = Route.useParams();
  const [activeView, setActiveView] = useState(0);
  const [csvOpen, setCsvOpen] = useState(false);
  const [ghOpen, setGhOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const view = VIEWS[activeView];

  const triggerAction = (a?: "csv" | "gh") => {
    if (a === "csv") setCsvOpen(true);
    if (a === "gh") setGhOpen(true);
  };

  return (
    <main style={{ minHeight: "100vh", paddingTop: 96 }}>
      <Sidebar />
      <div style={{ marginLeft: 288, paddingRight: 24, paddingBottom: 64 }}>
        {/* Title */}
        <div className="eyebrow mb-2">// app / {id}</div>
        <h1 className="display-xl" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
          {id}
        </h1>

        {/* TOP ACTION BAR */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeExpo, delay: 0.1 }}
          className="mt-6 flex flex-wrap gap-3"
        >
          {ACTIONS.map((a) => (
            <button
              key={a.label}
              onClick={() => triggerAction(a.action)}
              title={a.tip}
              className="group relative flex items-center gap-2 rounded-lg px-4 py-2.5"
              style={{
                border: `1px solid ${a.color}55`,
                color: a.color,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                letterSpacing: "0.08em",
                background: "transparent",
                transition: "background 200ms ease, border-color 200ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = `${a.color}1A`)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <a.Icon size={14} />
              {a.label}
            </button>
          ))}
        </motion.div>

        {/* PROMPT SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeExpo, delay: 0.2 }}
          className="glass-card mt-6 p-5"
        >
          <div className="eyebrow mb-3">// refine your app with ai</div>
          <div className="flex gap-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Add a new field to tasks, create a relationship between contacts and deals, add email validation to the form..."
              className="input-forge"
              style={{
                minHeight: 84,
                resize: "vertical",
                fontFamily: "var(--font-mono)",
                background: "#08081A",
              }}
            />
            <button className="btn-forge whitespace-nowrap self-start">REGENERATE →</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { label: "Add a new table", t: "Add a new table called " },
              { label: "Add a field", t: "Add a field called X of type string to the " },
              { label: "Change field type", t: "Change the type of field X to " },
            ].map((c) => (
              <button
                key={c.label}
                onClick={() => setPrompt(c.t)}
                className="rounded-full px-3 py-1.5 text-xs"
                style={{
                  border: "1px solid rgba(168,85,247,0.3)",
                  background: "rgba(124,58,237,0.06)",
                  color: "var(--forge-violet-bright)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* THREE PANEL LAYOUT */}
        <div className="mt-6 grid gap-4" style={{ gridTemplateColumns: "200px 1fr 280px" }}>
          {/* LEFT — VIEWS */}
          <div className="glass-card p-4">
            <div className="eyebrow mb-3" style={{ fontSize: "0.6rem" }}>
              // views
            </div>
            <div className="flex flex-col gap-1">
              {VIEWS.map((v, i) => (
                <button
                  key={v.name}
                  onClick={() => setActiveView(i)}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-left"
                  style={{
                    background: activeView === i ? "rgba(168,85,247,0.08)" : "transparent",
                    borderLeft:
                      activeView === i
                        ? "2px solid var(--forge-violet-bright)"
                        : "2px solid transparent",
                    color:
                      activeView === i
                        ? "var(--forge-violet-bright)"
                        : "var(--forge-text-secondary)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    transition: "all 200ms ease",
                  }}
                >
                  <span className="flex items-center gap-2">
                    <v.Icon size={13} />
                    {v.name}
                  </span>
                  {v.count > 0 && (
                    <span
                      style={{
                        fontSize: 10,
                        padding: "1px 6px",
                        borderRadius: 999,
                        background: "rgba(168,85,247,0.15)",
                      }}
                    >
                      {v.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button
              className="btn-ghost mt-4 w-full !py-2 !px-3 !text-xs"
              style={{ borderColor: "rgba(168,85,247,0.4)", color: "var(--forge-violet-bright)" }}
            >
              + ADD VIEW
            </button>
          </div>

          {/* CENTER — MAIN CONTENT */}
          <div className="glass-card p-5" style={{ minHeight: 480 }}>
            {view.type === "table" && (
              <>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search
                        size={14}
                        style={{
                          position: "absolute",
                          left: 10,
                          top: "50%",
                          marginTop: -7,
                          color: "var(--forge-text-muted)",
                        }}
                      />
                      <input
                        className="input-forge"
                        placeholder="Search..."
                        style={{ padding: "8px 12px 8px 32px", fontSize: 12, width: 200 }}
                      />
                    </div>
                    <button className="btn-ghost !py-2 !px-3 !text-xs">
                      <Filter size={12} /> Filter
                    </button>
                    <button className="btn-ghost !py-2 !px-3 !text-xs">
                      <ArrowUpDown size={12} /> Sort
                    </button>
                  </div>
                  <button className="btn-forge !py-2 !px-4 !text-xs">
                    <Plus size={12} /> ADD ROW
                  </button>
                </div>
                <div
                  className="overflow-x-auto rounded-lg"
                  style={{ border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                        {FIELDS.map((f) => (
                          <th
                            key={f}
                            className="eyebrow"
                            style={{
                              padding: "12px 16px",
                              textAlign: "left",
                              fontSize: "0.6rem",
                              color: "var(--forge-violet-bright)",
                            }}
                          >
                            <span className="flex items-center gap-1">
                              {f} <ArrowUpDown size={10} />
                            </span>
                          </th>
                        ))}
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {ROWS.map((row, i) => (
                        <tr
                          key={i}
                          className="group"
                          style={{
                            background: i % 2 ? "#0A0A0F" : "#0F0F1A",
                            transition: "background 150ms",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "rgba(168,85,247,0.06)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = i % 2 ? "#0A0A0F" : "#0F0F1A")
                          }
                        >
                          {FIELDS.map((f) => (
                            <td
                              key={f}
                              style={{ padding: "12px 16px", fontFamily: "var(--font-mono)" }}
                            >
                              {(row as Record<string, string>)[f]}
                            </td>
                          ))}
                          <td style={{ padding: "12px 16px", textAlign: "right" }}>
                            <span className="opacity-0 group-hover:opacity-100 inline-flex gap-2 transition-opacity">
                              <Pencil size={13} color="var(--forge-cyan-bright)" />
                              <Trash2 size={13} color="var(--forge-coral-bright)" />
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div
                  className="mt-4 flex items-center justify-between text-xs"
                  style={{ color: "var(--forge-text-secondary)", fontFamily: "var(--font-mono)" }}
                >
                  <span>Showing 1-8 of {view.count} records</span>
                  <div className="flex gap-2">
                    <button className="btn-ghost !py-1.5 !px-3 !text-xs">← Prev</button>
                    <button className="btn-ghost !py-1.5 !px-3 !text-xs">Next →</button>
                  </div>
                </div>
              </>
            )}

            {view.type === "form" && (
              <div className="max-w-xl mx-auto">
                <div className="eyebrow mb-2">// new record</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800 }}>
                  Add a contact
                </h3>
                <div className="mt-6 flex flex-col gap-4">
                  {[
                    { label: "name", req: true, type: "text" },
                    { label: "email", req: true, type: "email" },
                    { label: "company", req: false, type: "text" },
                    { label: "phone", req: false, type: "text" },
                    { label: "stage", req: true, type: "select" },
                    { label: "notes", req: false, type: "textarea" },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="eyebrow mb-2 block" style={{ fontSize: "0.6rem" }}>
                        // {f.label}
                        {f.req && <span style={{ color: "var(--forge-violet-bright)" }}> *</span>}
                      </label>
                      {f.type === "textarea" ? (
                        <textarea className="input-forge" rows={3} />
                      ) : f.type === "select" ? (
                        <select className="input-forge">
                          <option>Lead</option>
                          <option>Qualified</option>
                          <option>Demo</option>
                          <option>Closed</option>
                        </select>
                      ) : (
                        <input className="input-forge" type={f.type} />
                      )}
                    </div>
                  ))}
                  <button className="btn-forge mt-2 w-full">[ SUBMIT RECORD ]</button>
                </div>
              </div>
            )}

            {view.type === "dashboard" && (
              <div>
                <div className="eyebrow mb-4">// overview</div>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { l: "Contacts", v: 247, c: "var(--forge-violet-bright)" },
                    { l: "Deals", v: 38, c: "var(--forge-cyan-bright)" },
                    { l: "Tasks", v: 84, c: "var(--forge-coral-bright)" },
                  ].map((s) => (
                    <div
                      key={s.l}
                      className="rounded-lg p-4"
                      style={{
                        border: "1px solid rgba(255,255,255,0.06)",
                        background: "rgba(255,255,255,0.02)",
                      }}
                    >
                      <div className="eyebrow" style={{ fontSize: "0.6rem" }}>
                        // {s.l}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 800,
                          fontSize: 28,
                          color: s.c,
                          marginTop: 4,
                        }}
                      >
                        {s.v}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="eyebrow mb-3">// records per table</div>
                <div className="flex items-end gap-3 h-32 mb-6">
                  {[
                    { l: "Contacts", v: 247, c: "var(--forge-violet-bright)" },
                    { l: "Deals", v: 38, c: "var(--forge-cyan-bright)" },
                    { l: "Tasks", v: 84, c: "var(--forge-coral-bright)" },
                  ].map((b) => (
                    <div key={b.l} className="flex-1 flex flex-col items-center gap-2">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(b.v / 247) * 100}%` }}
                        transition={{ duration: 0.8, ease: easeExpo }}
                        style={{
                          width: "100%",
                          background: `linear-gradient(180deg, ${b.c}, transparent)`,
                          borderTop: `2px solid ${b.c}`,
                          boxShadow: `0 0 24px ${b.c}55`,
                          borderRadius: "4px 4px 0 0",
                        }}
                      />
                      <span className="eyebrow" style={{ fontSize: "0.55rem" }}>
                        {b.l}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="eyebrow mb-3">// recent activity</div>
                <div
                  className="space-y-1 font-mono text-xs"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--forge-text-secondary)" }}
                >
                  {[
                    "[12:04] CREATE contact #248",
                    "[11:58] UPDATE deal #38 stage → Closed",
                    "[11:42] IMPORT 247 rows to contacts",
                    "[11:30] CREATE table tasks",
                    "[11:14] AUTOMATION fired: new-contact → slack",
                  ].map((l) => (
                    <div key={l}>{l}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — DETAILS SIDEBAR */}
          <div className="flex flex-col gap-4">
            <div className="glass-card p-4">
              <div className="eyebrow mb-3" style={{ fontSize: "0.6rem" }}>
                // app info
              </div>
              <div
                className="space-y-2 text-xs font-mono"
                style={{ color: "var(--forge-text-secondary)" }}
              >
                <div className="flex justify-between">
                  <span>name</span>
                  <span style={{ color: "var(--forge-text)" }}>{id}</span>
                </div>
                <div className="flex justify-between">
                  <span>created</span>
                  <span>2026-05-12</span>
                </div>
                <div className="flex justify-between">
                  <span>modified</span>
                  <span>just now</span>
                </div>
                <div className="flex justify-between">
                  <span>tables</span>
                  <span style={{ color: "var(--forge-cyan-bright)" }}>3</span>
                </div>
                <div className="flex justify-between">
                  <span>records</span>
                  <span style={{ color: "var(--forge-cyan-bright)" }}>369</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="eyebrow mb-3" style={{ fontSize: "0.6rem" }}>
                // tables
              </div>
              <div className="space-y-2 text-xs font-mono">
                {[
                  { n: "contacts", f: 6, r: 247 },
                  { n: "deals", f: 8, r: 38 },
                  { n: "tasks", f: 5, r: 84 },
                ].map((t) => (
                  <button
                    key={t.n}
                    className="w-full flex items-center justify-between rounded-md px-2 py-2 text-left"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                  >
                    <span style={{ color: "var(--forge-violet-bright)" }}>{t.n}</span>
                    <span style={{ color: "var(--forge-text-muted)" }}>
                      {t.f}f · {t.r}r
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="eyebrow mb-3" style={{ fontSize: "0.6rem" }}>
                // quick actions
              </div>
              <div className="space-y-2 text-xs">
                <button onClick={() => setCsvOpen(true)} className="block nav-link text-left">
                  → Import CSV data
                </button>
                <button onClick={() => setGhOpen(true)} className="block nav-link text-left">
                  → Export to GitHub
                </button>
                <button className="block nav-link text-left">→ Add automation rule</button>
                <button className="block nav-link text-left" style={{ opacity: 0.5 }}>
                  → Invite collaborator (soon)
                </button>
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="eyebrow mb-3" style={{ fontSize: "0.6rem" }}>
                // automations
              </div>
              <div className="space-y-2 text-xs font-mono">
                {[
                  { e: "on contact.create", a: "→ slack notify", on: true },
                  { e: "on deal.close", a: "→ email owner", on: true },
                  { e: "on task.overdue", a: "→ reassign", on: false },
                ].map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-md p-2"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                  >
                    <div>
                      <div style={{ color: "var(--forge-gold-bright)" }}>{r.e}</div>
                      <div style={{ color: "var(--forge-text-muted)", fontSize: 10 }}>{r.a}</div>
                    </div>
                    <div
                      style={{
                        width: 28,
                        height: 16,
                        borderRadius: 999,
                        background: r.on ? "var(--forge-violet)" : "rgba(255,255,255,0.1)",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 2,
                          left: r.on ? 14 : 2,
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: "#fff",
                          transition: "left 200ms ease",
                        }}
                      />
                    </div>
                  </div>
                ))}
                <button
                  className="w-full text-left mt-2"
                  style={{ color: "var(--forge-violet-bright)" }}
                >
                  + ADD RULE
                </button>
              </div>
            </div>

            <Link to="/new" className="btn-ghost !text-xs">
              Re-prompt this app
            </Link>
          </div>
        </div>
      </div>

      <CSVImportModal
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        tableName={view.type === "table" ? view.name : "Contacts"}
        fields={FIELDS}
      />
      <GitHubExportModal open={ghOpen} onClose={() => setGhOpen(false)} appName={id} />
    </main>
  );
}

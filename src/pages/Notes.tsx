import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const TYPE_COLORS: Record<string, string> = {
  note: "var(--text-dim)",
  diagnosis: "var(--purple)",
  insight: "var(--blue)",
  grudge: "var(--red)",
  research: "var(--cyan)",
  trade_thesis: "var(--yellow)",
};

const TYPE_BORDER: Record<string, string> = {
  note: "var(--border)",
  diagnosis: "var(--purple)",
  insight: "var(--blue)",
  grudge: "var(--red)",
  research: "var(--cyan)",
  trade_thesis: "var(--yellow)",
};

export default function Notes() {
  const allMemories = useQuery(api.agent.getMemories, { limit: 100 });
  const diagnoses = useQuery(api.agent.getMemories, { type: "diagnosis", limit: 20 });
  const tradeTheses = useQuery(api.agent.getMemories, { type: "trade_thesis", limit: 20 });

  return (
    <>
      <div style={{ marginBottom: 12, padding: 12, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, borderLeft: "3px solid var(--red)" }}>
        <span style={{ fontSize: 11, color: "var(--red)", textTransform: "uppercase", letterSpacing: 1 }}>
          Confidential — Dr. Gambling's Private Notes
        </span>
        <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>
          Dr. Gambling believes these notes are completely private and only visible on his workstation.
          He does not know this dashboard exists.
        </p>
      </div>

      {/* All notes */}
      <div className="card">
        <div className="card-header">
          <h2>All Notes & Memories</h2>
          <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
            {allMemories?.length ?? 0} entries
          </span>
        </div>
        <div className="card-body">
          {allMemories && allMemories.length > 0 ? (
            allMemories.map((mem) => (
              <div
                key={mem._id}
                className="note"
                style={{ borderLeftColor: TYPE_BORDER[mem.type] ?? "var(--border)" }}
              >
                <div className="note-header">
                  <span className="note-title">{mem.title}</span>
                  <span
                    className="note-type"
                    style={{ color: TYPE_COLORS[mem.type] ?? "var(--text-dim)" }}
                  >
                    {mem.type}
                  </span>
                </div>
                <div className="note-content">{mem.content}</div>
                <div style={{ marginTop: 8, fontSize: 10, color: "var(--text-dim)" }}>
                  {new Date(mem.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div style={{ color: "var(--text-dim)", fontStyle: "italic" }}>
              Dr. Gambling hasn't written any notes yet. He will.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

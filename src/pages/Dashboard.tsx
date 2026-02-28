import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getCeoImage, getDoctorImage, HOSPITAL_INTERIOR } from "../images";

function formatMoney(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(2)}`;
}

function pnlClass(n: number): string {
  if (n > 0) return "positive";
  if (n < 0) return "negative";
  return "";
}

export default function Dashboard() {
  const pension = useQuery(api.portfolio.getPensionFund);
  const portfolio = useQuery(api.portfolio.getSummary);
  const patients = useQuery(api.patients.getActive);
  const prices = useQuery(api.market.getLatestPrices);
  const chat = useQuery(api.chat.recent);

  return (
    <>
      {/* Top stats */}
      <div className="grid-4">
        <div className="stat">
          <div className="stat-label">Pension Fund</div>
          <div
            className={`stat-value ${pension ? pnlClass(pension.effectiveBalance - pension.initialBalance) : ""}`}
          >
            {pension ? formatMoney(pension.effectiveBalance) : "---"}
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Unrealized P&L</div>
          <div
            className={`stat-value ${pension ? pnlClass(pension.unrealizedPnl) : ""}`}
          >
            {pension
              ? `${pension.unrealizedPnl >= 0 ? "+" : ""}${formatMoney(pension.unrealizedPnl)}`
              : "---"}
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Open Positions</div>
          <div className="stat-value">
            {portfolio?.openPositions ?? "---"}
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Active Patients</div>
          <div className="stat-value warning">
            {patients?.length ?? "---"}
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Market Overview */}
        <div className="card">
          <div className="card-header">
            <h2>Market Overview</h2>
          </div>
          <div className="card-body">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Ticker</th>
                  <th>Company</th>
                  <th>Price</th>
                  <th>CEO Status</th>
                </tr>
              </thead>
              <tbody>
                {prices?.map((p) => {
                  const img = getCeoImage(p.name ?? p.company);
                  return (
                  <tr key={p.ticker}>
                    <td style={{ width: 40, padding: "4px 8px" }}>
                      {img && <img src={img} alt="" className="avatar avatar-sm" />}
                    </td>
                    <td style={{ fontWeight: 700 }}>{p.ticker}</td>
                    <td>{p.company}</td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>
                      <span
                        className={`badge ${
                          p.status === "alive"
                            ? "badge-green"
                            : p.status === "critical"
                              ? "badge-red"
                              : p.status === "cured"
                                ? "badge-blue"
                                : "badge-purple"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Chat */}
        <div className="card">
          <div className="card-header">
            <h2>Group Chat</h2>
          </div>
          <div className="card-body" style={{ maxHeight: 400, overflowY: "auto" }}>
            {chat?.map((msg) => {
              const isGambling = msg.sender === "Dr. Gambling";
              const isSystem = msg.sender === "SYSTEM";
              const avatar = getDoctorImage(msg.sender);
              return (
                <div
                  key={msg._id}
                  className={`chat-message ${isGambling ? "dr-gambling" : isSystem ? "system" : "human"}`}
                  style={{ marginBottom: 8, display: "flex", gap: 10, alignItems: "flex-start" }}
                >
                  {avatar && <img src={avatar} alt="" className="avatar avatar-md" />}
                  <div style={{ flex: 1 }}>
                    <div
                      className={`chat-sender ${isGambling ? "dr-gambling" : isSystem ? "system" : "human"}`}
                    >
                      {msg.sender}
                    </div>
                    <div>{msg.content}</div>
                  </div>
                </div>
              );
            })}
            {(!chat || chat.length === 0) && (
              <div style={{ color: "var(--text-dim)", fontStyle: "italic" }}>
                No messages yet. The group chat is quiet... for now.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Open Positions */}
      {portfolio && portfolio.positions.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2>Open Positions</h2>
            <span className={`stat-value ${pnlClass(portfolio.totalUnrealizedPnl)}`} style={{ fontSize: 14 }}>
              Total: {portfolio.totalUnrealizedPnl >= 0 ? "+" : ""}
              {formatMoney(portfolio.totalUnrealizedPnl)}
            </span>
          </div>
          <div className="card-body">
            <table>
              <thead>
                <tr>
                  <th>Ticker</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Entry</th>
                  <th>Current</th>
                  <th>P&L</th>
                  <th>Reasoning</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.positions.map((pos) => (
                  <tr key={pos._id}>
                    <td style={{ fontWeight: 700 }}>{pos.ticker}</td>
                    <td>
                      <span
                        className={`badge ${pos.type === "short" ? "badge-red" : "badge-green"}`}
                      >
                        {pos.type}
                      </span>
                    </td>
                    <td>{pos.quantity}</td>
                    <td>${pos.entryPrice.toFixed(2)}</td>
                    <td>${pos.currentPrice.toFixed(2)}</td>
                    <td className={pnlClass(pos.pnl)}>
                      {pos.pnl >= 0 ? "+" : ""}
                      {formatMoney(pos.pnl)}
                    </td>
                    <td style={{ fontSize: 11, color: "var(--text-dim)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {pos.reasoning ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

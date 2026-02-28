import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

function formatMoney(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(2)}`;
}

export default function Portfolio() {
  const pension = useQuery(api.portfolio.getPensionFund);
  const openPositions = useQuery(api.portfolio.getPositions, { status: "open" });
  const closedPositions = useQuery(api.portfolio.getPositions, { status: "closed" });
  const trades = useQuery(api.portfolio.getTrades, { limit: 30 });

  const totalOpen = openPositions?.reduce((s, p) => s + p.pnl, 0) ?? 0;
  const totalClosed = closedPositions?.reduce((s, p) => s + p.pnl, 0) ?? 0;

  return (
    <>
      {/* Pension Fund Overview */}
      <div className="grid-3">
        <div className="stat">
          <div className="stat-label">Pension Balance</div>
          <div className="stat-value">
            {pension ? formatMoney(pension.balance) : "---"}
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Allocated to Positions</div>
          <div className="stat-value warning">
            {pension ? formatMoney(pension.allocatedToPositions) : "---"}
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Effective Value</div>
          <div className={`stat-value ${pension && pension.effectiveBalance < pension.initialBalance ? "negative" : "positive"}`}>
            {pension ? formatMoney(pension.effectiveBalance) : "---"}
          </div>
        </div>
      </div>

      {/* Open Positions */}
      <div className="card">
        <div className="card-header">
          <h2>Open Positions</h2>
          <span style={{ fontSize: 12, color: totalOpen >= 0 ? "var(--green)" : "var(--red)" }}>
            Unrealized: {totalOpen >= 0 ? "+" : ""}{formatMoney(totalOpen)}
          </span>
        </div>
        <div className="card-body">
          {openPositions && openPositions.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Ticker</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Entry</th>
                  <th>Current</th>
                  <th>P&L</th>
                </tr>
              </thead>
              <tbody>
                {openPositions.map((p) => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 700 }}>{p.ticker}</td>
                    <td><span className={`badge ${p.type === "short" ? "badge-red" : "badge-green"}`}>{p.type}</span></td>
                    <td>{p.quantity}</td>
                    <td>${p.entryPrice.toFixed(2)}</td>
                    <td>${p.currentPrice.toFixed(2)}</td>
                    <td style={{ color: p.pnl >= 0 ? "var(--green)" : "var(--red)" }}>
                      {p.pnl >= 0 ? "+" : ""}{formatMoney(p.pnl)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ color: "var(--text-dim)", fontStyle: "italic" }}>
              No open positions. The pension fund is safe... for now.
            </div>
          )}
        </div>
      </div>

      {/* Closed Positions */}
      <div className="card">
        <div className="card-header">
          <h2>Closed Positions</h2>
          <span style={{ fontSize: 12, color: totalClosed >= 0 ? "var(--green)" : "var(--red)" }}>
            Realized: {totalClosed >= 0 ? "+" : ""}{formatMoney(totalClosed)}
          </span>
        </div>
        <div className="card-body">
          {closedPositions && closedPositions.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Ticker</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Entry</th>
                  <th>Close</th>
                  <th>P&L</th>
                </tr>
              </thead>
              <tbody>
                {closedPositions.map((p) => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 700 }}>{p.ticker}</td>
                    <td><span className={`badge ${p.type === "short" ? "badge-red" : "badge-green"}`}>{p.type}</span></td>
                    <td>{p.quantity}</td>
                    <td>${p.entryPrice.toFixed(2)}</td>
                    <td>${p.currentPrice.toFixed(2)}</td>
                    <td style={{ color: p.pnl >= 0 ? "var(--green)" : "var(--red)", fontWeight: 700 }}>
                      {p.pnl >= 0 ? "+" : ""}{formatMoney(p.pnl)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ color: "var(--text-dim)", fontStyle: "italic" }}>
              No closed positions yet.
            </div>
          )}
        </div>
      </div>

      {/* Recent Trades */}
      <div className="card">
        <div className="card-header">
          <h2>Trade History</h2>
        </div>
        <div className="card-body">
          {trades && trades.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Ticker</th>
                  <th>Action</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <tr key={t._id}>
                    <td style={{ color: "var(--text-dim)" }}>
                      {new Date(t.simTime).toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 700 }}>{t.ticker}</td>
                    <td>
                      <span className={`badge ${t.action === "short" || t.action === "sell" ? "badge-red" : "badge-green"}`}>
                        {t.action}
                      </span>
                    </td>
                    <td>{t.quantity}</td>
                    <td>${t.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ color: "var(--text-dim)", fontStyle: "italic" }}>
              No trades executed yet.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getCeoImage } from "../images";

export default function Patients() {
  const patients = useQuery(api.patients.list);
  const ceos = useQuery(api.market.listCeos);

  return (
    <>
      {/* Active Patients */}
      <div className="card">
        <div className="card-header">
          <h2>Active Patients</h2>
        </div>
        <div className="card-body">
          {patients?.filter((p) => p.status === "active").map((patient) => {
            const ceoImg = getCeoImage(patient.ceo?.name ?? "");
            return (
            <div key={patient._id} style={{ marginBottom: 20, padding: 16, background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {ceoImg && <img src={ceoImg} alt="" className="avatar avatar-lg" />}
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text-bright)" }}>
                      {patient.ceo?.name}
                    </span>
                    <br />
                    <span style={{ color: "var(--text-dim)" }}>
                      {patient.ceo?.company} ({patient.ceo?.ticker})
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className={`badge ${patient.trajectory === "declining" ? "badge-red" : patient.trajectory === "improving" ? "badge-green" : "badge-yellow"}`}>
                    {patient.trajectory}
                  </span>
                  <span className="badge badge-red">
                    Severity: {(patient.severity * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: 8, color: "var(--text-dim)", fontSize: 12 }}>
                Presenting: {patient.presentingComplaint}
              </div>

              {patient.diagnosis && (
                <div style={{ marginBottom: 8, padding: 8, background: "var(--bg-card)", borderRadius: 4, borderLeft: "3px solid var(--phosphor)" }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "var(--phosphor)", marginBottom: 4 }}>
                    Dr. Gambling's Diagnosis ({((patient.diagnosisConfidence ?? 0) * 100).toFixed(0)}% confidence)
                  </div>
                  <div style={{ fontWeight: 700 }}>{patient.diagnosis}</div>
                  {patient.diagnosisReasoning && (
                    <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
                      {patient.diagnosisReasoning}
                    </div>
                  )}
                </div>
              )}

              {/* Latest vitals */}
              {patient.vitals.length > 0 && (() => {
                const v = patient.vitals[patient.vitals.length - 1];
                return (
                  <div className="grid-4" style={{ marginTop: 8 }}>
                    <div className="stat" style={{ padding: 8 }}>
                      <div className="stat-label">HR</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: v.heartRate > 120 ? "var(--red)" : "var(--text-bright)" }}>
                        {v.heartRate} bpm
                      </div>
                    </div>
                    <div className="stat" style={{ padding: 8 }}>
                      <div className="stat-label">BP</div>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>{v.bloodPressure}</div>
                    </div>
                    <div className="stat" style={{ padding: 8 }}>
                      <div className="stat-label">Temp</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: v.temperature > 38.5 ? "var(--red)" : "var(--text-bright)" }}>
                        {v.temperature.toFixed(1)}°C
                      </div>
                    </div>
                    <div className="stat" style={{ padding: 8 }}>
                      <div className="stat-label">SpO2</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: v.oxygenSaturation < 92 ? "var(--red)" : "var(--text-bright)" }}>
                        {v.oxygenSaturation}%
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            );
          })}
          {patients?.filter((p) => p.status === "active").length === 0 && (
            <div style={{ color: "var(--text-dim)", fontStyle: "italic" }}>
              No active patients. Dr. Gambling is looking for his next target.
            </div>
          )}
        </div>
      </div>

      {/* CEO Directory */}
      <div className="card">
        <div className="card-header">
          <h2>CEO Directory</h2>
        </div>
        <div className="card-body">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Company</th>
                <th>Ticker</th>
                <th>Age</th>
                <th>Status</th>
                <th>Key Conditions</th>
              </tr>
            </thead>
            <tbody>
              {ceos?.map((ceo) => (
                <tr key={ceo._id}>
                  <td style={{ width: 44, padding: "4px 8px" }}>
                    {getCeoImage(ceo.name) && <img src={getCeoImage(ceo.name)!} alt="" className="avatar avatar-sm" />}
                  </td>
                  <td style={{ fontWeight: 700 }}>{ceo.name}</td>
                  <td>{ceo.company}</td>
                  <td>{ceo.ticker}</td>
                  <td>{ceo.age}</td>
                  <td>
                    <span className={`badge ${
                      ceo.status === "alive" ? "badge-green" :
                      ceo.status === "critical" ? "badge-red" :
                      ceo.status === "cured" ? "badge-blue" : "badge-purple"
                    }`}>
                      {ceo.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 11, color: "var(--text-dim)" }}>
                    {ceo.healthProfile.conditions.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

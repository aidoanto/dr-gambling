import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getDoctorImage, HOSPITAL_INTERIOR } from "../images";

function formatMoney(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(2)}`;
}

const PUBLICATIONS = [
  {
    title: "Short Selling as a Therapeutic Vector: A Novel Framework for Incentive-Aligned Diagnostics",
    journal: "Journal of Theoretical Medicine & Applied Finance",
    year: 2024,
    status: "Under review (rejected 4 times)",
  },
  {
    title: "Correlation Between CEO Mortality Events and Post-Mortem Equity Repricing: A Retrospective Analysis",
    journal: "The Lancet (submitted)",
    year: 2023,
    status: "Desk rejected",
  },
  {
    title: "Micromedicine: Hyper-Niche Diagnostic Interventions Derived from Alternative Data Sources",
    journal: "Internal memo (circulated without authorization)",
    year: 2023,
    status: "Cited by SEC",
  },
  {
    title: "On the Fiduciary Duty of Hospital Pension Fund Managers to Hedge Tail Risk via Medical Intelligence",
    journal: "St. Ambrose Ethics Board Hearing Transcript",
    year: 2022,
    status: "Entered into evidence",
  },
  {
    title: "Bloomberg Terminal Integration with Electronic Health Records: A Proof of Concept",
    journal: "IEEE Transactions on Biomedical Engineering",
    year: 2021,
    status: "Published (retracted 2022)",
  },
];

const CERTIFICATIONS = [
  "Board Certified, Internal Medicine (lapsed)",
  "Board Certified, Diagnostic Radiology (lapsed)",
  "Bloomberg Market Concepts (BMC) Certificate",
  "Series 7 — General Securities Representative (active)",
  "Series 63 — Uniform Securities Agent (active)",
  "FINRA Arbitration Training (court-ordered)",
  "Hospital Ethics Compliance Seminar (court-ordered, 3x)",
];

const SKILLS = [
  { name: "Diagnostic Pattern Recognition", level: 98 },
  { name: "Equity Valuation & Short Selling", level: 95 },
  { name: "Bloomberg Terminal", level: 99 },
  { name: "Options Pricing (Black-Scholes)", level: 92 },
  { name: "Pension Fund Management", level: 45 },
  { name: "Medical Ethics", level: 12 },
  { name: "Interpersonal Skills", level: 8 },
  { name: "Following Hospital Policy", level: 3 },
];

const ENDORSEMENTS = [
  { from: "Dr. Yuen", skill: "Diagnostic Pattern Recognition", note: "Reluctantly, yes. He is good at this." },
  { from: "Dr. Patel", skill: "Diagnostic Pattern Recognition", note: "Genuinely extraordinary, which makes everything else worse." },
  { from: "Dr. Kowalski", skill: "Bloomberg Terminal", note: "I have never seen a doctor use a Bloomberg terminal. I have now seen it too many times." },
  { from: "HR Department", skill: "Following Hospital Policy", note: "We cannot endorse this skill as we have no evidence it exists." },
  { from: "SEC Investigator", skill: "Equity Valuation & Short Selling", note: "No comment at this time." },
];

const EXPERIENCE = [
  {
    role: "Attending Diagnostician & Self-Appointed Director of Pension Strategy",
    org: "St. Ambrose Teaching Hospital",
    period: "2019 — Present",
    description: "Lead diagnostician specializing in high-net-worth executive health profiles. Pioneered the field of 'micromedicine' — hyper-niche diagnostic interventions derived from alternative data. Voluntary (unauthorized) oversight of hospital pension fund allocation strategy.",
  },
  {
    role: "Diagnostic Fellow",
    org: "Johns Hopkins Hospital",
    period: "2015 — 2019",
    description: "Completed diagnostic medicine fellowship. Asked to leave after installing a Bloomberg terminal in the residents' lounge and attempting to short pharmaceutical stocks based on clinical trial data he observed during rounds.",
  },
  {
    role: "Resident, Internal Medicine",
    org: "Massachusetts General Hospital",
    period: "2011 — 2015",
    description: "Internal medicine residency. First resident to be simultaneously nominated for the Excellence in Diagnosis award and referred to the ethics board in the same quarter.",
  },
  {
    role: "M.D.",
    org: "Columbia University College of Physicians and Surgeons",
    period: "2007 — 2011",
    description: "Medical degree. Thesis: 'Information Asymmetry in Clinical Settings: A Framework for Value Extraction.' Advisor described it as 'technically brilliant and morally bankrupt.'",
  },
  {
    role: "B.S. Applied Mathematics & Economics (Double Major)",
    org: "MIT",
    period: "2003 — 2007",
    description: "Summa cum laude. Senior thesis on stochastic models for predicting corporate leadership health events. Already thinking about this, apparently.",
  },
];

export default function Profile() {
  const portfolio = useQuery(api.portfolio.getSummary);
  const pension = useQuery(api.portfolio.getPensionFund);
  const patients = useQuery(api.patients.getActive);
  const memories = useQuery(api.agent.getMemories, { limit: 5 });

  const avatar = getDoctorImage("Dr. Gambling");
  const totalDiagnoses = memories?.filter(m => m.type === "diagnosis").length ?? 0;

  return (
    <>
      {/* Profile banner */}
      <div className="profile-banner" style={{
        backgroundImage: `linear-gradient(to bottom, rgba(10,14,20,0.3), var(--bg-card)), url(${HOSPITAL_INTERIOR})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "40px 32px 24px",
        borderRadius: 6,
        border: "1px solid var(--border)",
        position: "relative",
      }}>
        <div style={{ position: "absolute", top: 12, right: 16, fontSize: 9, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1 }}>
          St. Ambrose Intranet / Staff Directory / Profile #4271
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-end" }}>
          {avatar && (
            <img
              src={avatar}
              alt="Dr. Bruno Gambling"
              style={{
                width: 120,
                height: 120,
                borderRadius: 8,
                border: "3px solid var(--phosphor)",
                objectFit: "cover",
                boxShadow: "0 4px 20px rgba(51, 255, 51, 0.2)",
              }}
            />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: "var(--phosphor)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>
              Staff Profile — Attending Physician
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-bright)", margin: 0, lineHeight: 1.2 }}>
              Dr. Bruno Gambling, M.D.
            </h2>
            <div style={{ fontSize: 13, color: "var(--text)", marginTop: 4 }}>
              Diagnostician &bull; Department of Internal Medicine &bull; St. Ambrose Teaching Hospital
            </div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>
              "Self-Appointed Director of Pension Strategy"
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
              <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                <span style={{ color: "var(--text-bright)", fontWeight: 700 }}>{portfolio?.openPositions ?? 0}</span> Open Positions
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                <span style={{ color: "var(--text-bright)", fontWeight: 700 }}>{patients?.length ?? 0}</span> Active Patients
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                <span style={{ color: "var(--text-bright)", fontWeight: 700 }}>{totalDiagnoses}</span> Diagnoses Filed
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                <span style={{ color: "var(--yellow)", fontWeight: 700 }}>3</span> Active Ethics Complaints
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tagline / bio */}
      <div className="card">
        <div className="card-header">
          <h2>About</h2>
          <span style={{ fontSize: 9, color: "var(--text-dim)" }}>Last edited by: B. Gambling (14 minutes ago)</span>
        </div>
        <div className="card-body" style={{ lineHeight: 1.7 }}>
          <p style={{ marginBottom: 12 }}>
            Diagnostician and independent researcher working at the intersection of clinical medicine and capital markets.
            Inventor of <strong style={{ color: "var(--phosphor)" }}>micromedicine</strong> — the discipline of extracting
            hyper-niche diagnostic insights from alternative data sources including SEC filings, satellite imagery,
            executive calendar metadata, and pharmacy benefit manager databases.
          </p>
          <p style={{ marginBottom: 12 }}>
            I believe the market is the most efficient diagnostic tool ever created. A stock price contains more
            information about a CEO's health than any blood panel. My job is to read between the ticks.
          </p>
          <p style={{ color: "var(--text-dim)", fontSize: 11 }}>
            Currently managing strategic allocation for the St. Ambrose Hospital Pension Fund (unauthorized).
            Pension fund balance: <span style={{ color: pension && pension.effectiveBalance < pension.initialBalance ? "var(--red)" : "var(--green)", fontWeight: 700 }}>
              {pension ? formatMoney(pension.effectiveBalance) : "---"}
            </span>
          </p>
        </div>
      </div>

      <div className="grid-2">
        {/* Experience */}
        <div className="card">
          <div className="card-header">
            <h2>Experience</h2>
          </div>
          <div className="card-body">
            {EXPERIENCE.map((exp, i) => (
              <div key={i} style={{
                marginBottom: 16,
                paddingBottom: 16,
                borderBottom: i < EXPERIENCE.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                <div style={{ fontWeight: 700, color: "var(--text-bright)", fontSize: 13 }}>
                  {exp.role}
                </div>
                <div style={{ fontSize: 12, color: "var(--phosphor)", marginTop: 2 }}>
                  {exp.org}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>
                  {exp.period}
                </div>
                <div style={{ fontSize: 11, color: "var(--text)", marginTop: 6, lineHeight: 1.6 }}>
                  {exp.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills & Certifications */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Skills */}
          <div className="card">
            <div className="card-header">
              <h2>Skills & Proficiencies</h2>
            </div>
            <div className="card-body">
              {SKILLS.map((skill) => (
                <div key={skill.name} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                    <span style={{ color: "var(--text)" }}>{skill.name}</span>
                    <span style={{
                      color: skill.level > 80 ? "var(--green)" : skill.level > 30 ? "var(--yellow)" : "var(--red)",
                      fontWeight: 700,
                    }}>
                      {skill.level}%
                    </span>
                  </div>
                  <div style={{
                    height: 4,
                    background: "var(--bg)",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${skill.level}%`,
                      height: "100%",
                      background: skill.level > 80 ? "var(--green)" : skill.level > 30 ? "var(--yellow)" : "var(--red)",
                      borderRadius: 2,
                      transition: "width 0.5s ease",
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="card">
            <div className="card-header">
              <h2>Certifications & Licenses</h2>
            </div>
            <div className="card-body">
              {CERTIFICATIONS.map((cert, i) => (
                <div key={i} style={{
                  padding: "6px 0",
                  borderBottom: i < CERTIFICATIONS.length - 1 ? "1px solid var(--border)" : "none",
                  fontSize: 11,
                  color: cert.includes("lapsed") ? "var(--text-dim)" : cert.includes("court-ordered") ? "var(--yellow)" : "var(--text)",
                }}>
                  {cert.includes("court-ordered") ? "\u26a0 " : cert.includes("active") ? "\u2713 " : cert.includes("lapsed") ? "\u2717 " : ""}{cert}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Publications */}
      <div className="card">
        <div className="card-header">
          <h2>Publications & Research</h2>
          <span style={{ fontSize: 10, color: "var(--text-dim)" }}>h-index: pending (disputed)</span>
        </div>
        <div className="card-body">
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>Title</th>
                <th>Venue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {PUBLICATIONS.map((pub, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700, width: 60 }}>{pub.year}</td>
                  <td style={{ color: "var(--text-bright)" }}>{pub.title}</td>
                  <td style={{ fontSize: 11, color: "var(--text-dim)", fontStyle: "italic" }}>{pub.journal}</td>
                  <td>
                    <span className={`badge ${
                      pub.status.includes("Published") ? "badge-green" :
                      pub.status.includes("review") ? "badge-yellow" :
                      pub.status.includes("rejected") || pub.status.includes("Desk") ? "badge-red" :
                      "badge-purple"
                    }`}>
                      {pub.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Endorsements */}
      <div className="card">
        <div className="card-header">
          <h2>Colleague Endorsements</h2>
          <span style={{ fontSize: 10, color: "var(--text-dim)" }}>Most of these were not solicited</span>
        </div>
        <div className="card-body">
          {ENDORSEMENTS.map((end, i) => (
            <div key={i} style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              marginBottom: 12,
              paddingBottom: 12,
              borderBottom: i < ENDORSEMENTS.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              {getDoctorImage(end.from) && (
                <img src={getDoctorImage(end.from)!} alt="" className="avatar avatar-sm" />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11 }}>
                  <strong style={{ color: "var(--blue)" }}>{end.from}</strong>
                  {" endorsed "}
                  <strong style={{ color: "var(--text-bright)" }}>{end.skill}</strong>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2, fontStyle: "italic" }}>
                  "{end.note}"
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer disclaimer */}
      <div style={{
        padding: 16,
        fontSize: 9,
        color: "var(--text-dim)",
        textAlign: "center",
        borderTop: "1px solid var(--border)",
        lineHeight: 1.6,
      }}>
        ST. AMBROSE TEACHING HOSPITAL &mdash; INTERNAL STAFF DIRECTORY<br />
        This profile was last modified by user <span style={{ color: "var(--phosphor)" }}>bgambling</span> (unauthorized admin access).<br />
        IT Department has been notified. Ticket #4271-B is open. This is the 7th ticket this quarter.
      </div>
    </>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { api } from "../convex/_generated/api";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Patients from "./pages/Patients";
import Chat from "./pages/Chat";
import Notes from "./pages/Notes";
import Profile from "./pages/Profile";
import { HOSPITAL_EXTERIOR } from "./images";
import type { Doc } from "../convex/_generated/dataModel";

type Page = "dashboard" | "portfolio" | "patients" | "chat" | "notes" | "profile";

function SignIn() {
  const { signIn } = useAuthActions();
  return (
    <div className="sign-in-gate">
      <div className="sign-in-box">
        <h1>ST. AMBROSE TEACHING HOSPITAL</h1>
        <p className="sign-in-subtitle">INTERNAL MONITORING SYSTEM</p>
        <p className="sign-in-warning">AUTHORIZED PERSONNEL ONLY</p>
        <button
          className="sign-in-btn"
          onClick={() => void signIn("google")}
        >
          Sign in with Google
        </button>
        <p className="sign-in-fine-print">
          Dr. Gambling doesn't know you can see this.
        </p>
      </div>
    </div>
  );
}

function CafeteriaPicker() {
  const available = useQuery(api.characters.available);
  const allCharacters = useQuery(api.characters.list);
  const claimCharacter = useMutation(api.characters.claim);

  const handleClaim = async (characterId: Doc<"characters">["_id"]) => {
    try {
      await claimCharacter({ characterId });
    } catch (e) {
      console.error("Failed to claim character:", e);
    }
  };

  if (!available || !allCharacters) {
    return (
      <div className="sign-in-gate">
        <div className="sign-in-box">
          <p style={{ color: "var(--phosphor)" }}>LOADING STAFF ROSTER...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cafeteria-gate">
      <div className="cafeteria-box">
        <h1>STAFF CAFETERIA</h1>
        <p className="cafeteria-subtitle">GRAB YOUR BADGE</p>
        <p className="cafeteria-hint">Pick a character to enter the hospital system</p>
        <div className="cafeteria-grid">
          {allCharacters.map((char) => {
            const isClaimed = !!char.claimedByUserId;
            return (
              <button
                key={char._id}
                className={`cafeteria-card ${isClaimed ? "claimed" : ""}`}
                disabled={isClaimed}
                onClick={() => !isClaimed && handleClaim(char._id)}
              >
                <img
                  src={char.imagePath}
                  alt={char.name}
                  className="avatar avatar-lg"
                  style={isClaimed ? { opacity: 0.3, filter: "grayscale(1)" } : {}}
                />
                <div className="cafeteria-card-info">
                  <div className="cafeteria-card-name">{char.name}</div>
                  <div className="cafeteria-card-role">{char.role}</div>
                </div>
                {isClaimed && (
                  <span className="badge badge-red" style={{ position: "absolute", top: 8, right: 8 }}>
                    TAKEN
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="sign-in-gate">
        <div className="sign-in-box">
          <p style={{ color: "var(--phosphor)" }}>AUTHENTICATING...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SignIn />;
  }

  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  const myCharacter = useQuery(api.characters.myCharacter);
  const [page, setPage] = useState<Page>("dashboard");
  const simState = useQuery(api.simulation.getState);
  const { signOut } = useAuthActions();

  // Still loading character query
  if (myCharacter === undefined) {
    return (
      <div className="sign-in-gate">
        <div className="sign-in-box">
          <p style={{ color: "var(--phosphor)" }}>LOADING...</p>
        </div>
      </div>
    );
  }

  // No character claimed — show cafeteria
  if (myCharacter === null) {
    return <CafeteriaPicker />;
  }

  const simTimeStr = simState?.simTime
    ? new Date(simState.simTime).toLocaleString()
    : "---";

  const speedStr = simState ? `${simState.speed}x` : "---";
  const paused = simState?.paused;

  return (
    <div className="app">
      <header className="header" style={{
        backgroundImage: `linear-gradient(to right, var(--bg-panel) 60%, transparent), url(${HOSPITAL_EXTERIOR})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={myCharacter.imagePath} alt="" className="avatar avatar-sm" />
          <div>
            <h1>St. Ambrose Teaching Hospital</h1>
            <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>
              {myCharacter.name} — {myCharacter.role}
            </div>
          </div>
        </div>
        <div className="status">
          <span className="live">{paused ? "PAUSED" : "LIVE"}</span>
          {" | "}SIM: {simTimeStr} | SPEED: {speedStr} | TICK #{simState?.tickCount ?? 0}
          {" | "}
          <button className="sign-out-btn" onClick={() => void signOut()}>
            Sign Out
          </button>
        </div>
      </header>
      <nav className="nav">
        {(
          [
            ["dashboard", "Dashboard"],
            ["portfolio", "Portfolio"],
            ["patients", "Patients"],
            ["chat", "Group Chat"],
            ["notes", "Dr. Gambling's Notes"],
            ["profile", "Staff Profile"],
          ] as const
        ).map(([key, label]) => (
          <a
            key={key}
            href="#"
            className={page === key ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setPage(key);
            }}
          >
            {label}
          </a>
        ))}
      </nav>
      <main className="main">
        {page === "dashboard" && <Dashboard />}
        {page === "portfolio" && <Portfolio />}
        {page === "patients" && <Patients />}
        {page === "chat" && <Chat character={myCharacter} />}
        {page === "notes" && <Notes />}
        {page === "profile" && <Profile />}
      </main>
    </div>
  );
}

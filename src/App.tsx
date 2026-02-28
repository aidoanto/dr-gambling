import { useState } from "react";
import { useQuery } from "convex/react";
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
  const [page, setPage] = useState<Page>("dashboard");
  const simState = useQuery(api.simulation.getState);
  const { signOut } = useAuthActions();

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
        <h1>St. Ambrose Teaching Hospital</h1>
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
        {page === "chat" && <Chat />}
        {page === "notes" && <Notes />}
        {page === "profile" && <Profile />}
      </main>
    </div>
  );
}

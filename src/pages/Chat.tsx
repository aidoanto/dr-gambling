import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getDoctorImage } from "../images";

export default function Chat() {
  const messages = useQuery(api.chat.list, { limit: 200 });
  const sendMessage = useMutation(api.chat.send);
  const [input, setInput] = useState("");
  const [senderName, setSenderName] = useState(() => {
    return localStorage.getItem("dr-gambling-chat-name") ?? "";
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !senderName.trim()) return;
    await sendMessage({
      sender: senderName.trim(),
      content: input.trim(),
    });
    setInput("");
  };

  if (!senderName) {
    return (
      <div className="card" style={{ maxWidth: 400, margin: "40px auto" }}>
        <div className="card-header">
          <h2>Join Group Chat</h2>
        </div>
        <div className="card-body">
          <p style={{ marginBottom: 16, color: "var(--text-dim)" }}>
            Enter your name to join the group chat with Dr. Gambling.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["Dr. Kowalski", "Dr. Yuen", "Dr. Patel"].map((name) => (
              <button
                key={name}
                onClick={() => {
                  localStorage.setItem("dr-gambling-chat-name", name);
                  setSenderName(name);
                }}
                style={{
                  background: "var(--bg-panel)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  padding: "12px 16px",
                  fontFamily: "inherit",
                  fontSize: 13,
                  cursor: "pointer",
                  borderRadius: 4,
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                {getDoctorImage(name) && (
                  <img src={getDoctorImage(name)} alt="" className="avatar avatar-md" />
                )}
                {name}
              </button>
            ))}
            <div style={{ marginTop: 8, borderTop: "1px solid var(--border)", paddingTop: 8 }}>
              <input
                type="text"
                placeholder="Or enter custom name..."
                style={{
                  width: "100%",
                  background: "var(--bg-panel)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  padding: "10px 14px",
                  fontFamily: "inherit",
                  fontSize: 13,
                  borderRadius: 4,
                  outline: "none",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value.trim()) {
                    const name = e.currentTarget.value.trim();
                    localStorage.setItem("dr-gambling-chat-name", name);
                    setSenderName(name);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card chat-container">
      <div className="card-header">
        <h2>Group Chat</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
            Logged in as: <strong style={{ color: "var(--blue)" }}>{senderName}</strong>
          </span>
          <button
            onClick={() => {
              localStorage.removeItem("dr-gambling-chat-name");
              setSenderName("");
            }}
            style={{
              background: "none",
              border: "1px solid var(--border)",
              color: "var(--text-dim)",
              padding: "4px 8px",
              fontFamily: "inherit",
              fontSize: 10,
              cursor: "pointer",
              borderRadius: 3,
            }}
          >
            SWITCH
          </button>
        </div>
      </div>
      <div className="chat-messages">
        {messages?.map((msg) => {
          const isGambling = msg.sender === "Dr. Gambling";
          const isSystem = msg.sender === "SYSTEM";
          const isMe = msg.sender === senderName;
          const avatar = getDoctorImage(msg.sender);
          return (
            <div
              key={msg._id}
              className={`chat-message ${isGambling ? "dr-gambling" : isSystem ? "system" : "human"}`}
              style={{
                ...(isMe ? { borderColor: "var(--blue)" } : {}),
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              {avatar && <img src={avatar} alt="" className="avatar avatar-md" style={{ flexShrink: 0 }} />}
              <div style={{ flex: 1 }}>
                <div className={`chat-sender ${isGambling ? "dr-gambling" : isSystem ? "system" : "human"}`}>
                  {msg.sender}
                  {msg.messageType !== "text" && (
                    <span className={`badge ${
                      msg.messageType === "trade_alert" ? "badge-yellow" :
                      msg.messageType === "diagnosis" ? "badge-purple" :
                      msg.messageType === "rant" ? "badge-red" : "badge-blue"
                    }`} style={{ marginLeft: 8 }}>
                      {msg.messageType}
                    </span>
                  )}
                </div>
                <div>{msg.content}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={`Message as ${senderName}...`}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

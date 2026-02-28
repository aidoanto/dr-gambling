import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getDoctorImage } from "../images";
import type { Doc } from "../../convex/_generated/dataModel";

interface ChatProps {
  character: Doc<"characters">;
}

export default function Chat({ character }: ChatProps) {
  const messages = useQuery(api.chat.list, { limit: 200 });
  const sendMessage = useMutation(api.chat.sendAsCharacter);
  const swapCharacter = useMutation(api.characters.swap);
  const available = useQuery(api.characters.available);
  const [input, setInput] = useState("");
  const [showSwap, setShowSwap] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage({ content: input.trim() });
    setInput("");
  };

  const handleSwap = async (newCharacterId: Doc<"characters">["_id"]) => {
    try {
      await swapCharacter({ newCharacterId });
      setShowSwap(false);
    } catch (e) {
      console.error("Failed to swap:", e);
    }
  };

  if (showSwap && available) {
    return (
      <div className="card" style={{ maxWidth: 600, margin: "40px auto" }}>
        <div className="card-header">
          <h2>Switch Character</h2>
          <button
            onClick={() => setShowSwap(false)}
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
            CANCEL
          </button>
        </div>
        <div className="card-body">
          {available.length === 0 ? (
            <p style={{ color: "var(--text-dim)" }}>No available characters. All badges are taken.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {available.map((char) => (
                <button
                  key={char._id}
                  onClick={() => handleSwap(char._id)}
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
                  <img src={char.imagePath} alt="" className="avatar avatar-md" />
                  <div>
                    <div style={{ fontWeight: 500 }}>{char.name}</div>
                    <div style={{ fontSize: 10, color: "var(--text-dim)" }}>{char.role}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card chat-container">
      <div className="card-header">
        <h2>Group Chat</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <img src={character.imagePath} alt="" className="avatar avatar-sm" />
          <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
            <strong style={{ color: "var(--blue)" }}>{character.name}</strong>
          </span>
          <button
            onClick={() => setShowSwap(true)}
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
          const isMe = msg.sender === character.name;
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
          placeholder={`Message as ${character.name}...`}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

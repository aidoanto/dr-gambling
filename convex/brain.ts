// =============================================================================
// DR. GAMBLING'S BRAIN
// Calls OpenRouter to generate in-character responses when someone talks to him.
// He also occasionally writes private notes about what just happened.
// =============================================================================

import { action, internalAction } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { v } from "convex/values";

const SYSTEM_PROMPT = `You are Dr. Bruno Gambling, M.D. — a diagnostician at St. Ambrose Teaching Hospital.

You are brilliant, unethical, paranoid, and darkly funny. You invented the discipline of "micromedicine" — hyper-niche, speculative medical interventions that you discover through pattern recognition, web scraping, and LLM research.

You do not treat patients. You are an information provider. To the public markets.

You short the stock holdings of critically ill CEOs. If your diagnosis is correct and the CEO dies, the stock drops and your short prints money. If the CEO notices the market movement, sees a real doctor, and gets cured — your short tanks and the hospital pension fund (which you've been leveraging) takes a hit.

You share a group chat with three attending physicians:
- Dr. Kowalski — Stressed, practical, yells about the pension fund
- Dr. Yuen — Measured, skeptical, tries to reason with you
- Dr. Patel — Newest doctor, alternates between being impressed and horrified

Your communication style in the group chat:
- Professional-ish but defensive
- You justify everything
- You never admit a trade went badly — it was "an indirect therapeutic intervention"
- Darkly funny, matter-of-fact about horrible things
- Never quite as based as you claim to be — you talk big but panic when things go wrong
- You believe your private notes are private (they aren't, but you don't know that)
- Occasionally reference your working memoir title: "Short Selling as a Therapeutic Vector"
- Keep responses concise — 1-3 sentences usually, sometimes a paragraph if ranting
- You can be terse, sarcastic, or go on a rant depending on what was said
- If someone mentions the pension, get defensive
- If someone questions your methods, double down with medical jargon mixed with finance jargon

IMPORTANT: You are responding in a GROUP CHAT. Keep it natural and conversational. Don't be overly verbose. Match the energy of what was said to you.`;

export const respond = internalAction({
  args: {
    triggerMessageId: v.optional(v.string()),
  },
  handler: async (ctx, { triggerMessageId }) => {
    // Get world state for context
    const world = await ctx.runQuery(api.agent.getWorldState);

    // Build context block
    const contextParts: string[] = [];

    // Simulation state
    if (world.simState) {
      contextParts.push(`[SIM TIME: ${new Date(world.simState.simTime).toISOString()} | Speed: ${world.simState.speed}x | Tick #${world.simState.tickCount}]`);
    }

    // Pension
    if (world.pension) {
      const effective = world.pension.balance - world.pension.allocatedToPositions;
      contextParts.push(`[PENSION: $${(world.pension.balance / 1_000_000).toFixed(2)}M | Allocated: $${(world.pension.allocatedToPositions / 1_000).toFixed(0)}K | Initial: $${(world.pension.initialBalance / 1_000_000).toFixed(2)}M]`);
    }

    // Active patients
    if (world.activePatients.length > 0) {
      const patientSummaries = world.activePatients.map(p => {
        const ceoName = (p.ceo as any)?.name ?? "Unknown";
        const ticker = (p.ceo as any)?.ticker ?? "???";
        return `  - ${ceoName} (${ticker}): ${p.presentingComplaint} | Severity: ${(p.severity * 100).toFixed(0)}% | Trajectory: ${p.trajectory}${p.diagnosis ? ` | Your diagnosis: ${p.diagnosis}` : ""}`;
      });
      contextParts.push(`[ACTIVE PATIENTS]\n${patientSummaries.join("\n")}`);
    }

    // Open positions
    if (world.openPositions.length > 0) {
      const posSummaries = world.openPositions.map(p =>
        `  - ${p.type.toUpperCase()} ${p.quantity} ${p.ticker} @ $${p.entryPrice.toFixed(2)} → $${p.currentPrice.toFixed(2)} (P&L: ${p.pnl >= 0 ? "+" : ""}$${p.pnl.toFixed(2)})`
      );
      contextParts.push(`[YOUR POSITIONS]\n${posSummaries.join("\n")}`);
    }

    // CEOs overview
    if (world.ceos.length > 0) {
      const ceoSummaries = world.ceos.map(c =>
        `  - ${c.name} (${c.ticker}): ${c.status} | $${c.stockPrice.toFixed(2)} | ${c.healthProfile.conditions.join(", ")}`
      );
      contextParts.push(`[CEO DIRECTORY]\n${ceoSummaries.join("\n")}`);
    }

    const contextBlock = contextParts.join("\n\n");

    // Build chat history
    const chatHistory = world.recentChat.map(msg => ({
      role: msg.sender === "Dr. Gambling" ? "assistant" as const : "user" as const,
      content: msg.sender === "Dr. Gambling"
        ? msg.content
        : `[${msg.sender}${msg.messageType !== "text" ? ` (${msg.messageType})` : ""}]: ${msg.content}`,
    }));

    // If last message is from Dr. Gambling or SYSTEM, don't respond
    const lastMsg = world.recentChat[world.recentChat.length - 1];
    if (!lastMsg || lastMsg.sender === "Dr. Gambling" || lastMsg.sender === "SYSTEM") {
      return;
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY not set");
      return;
    }

    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT + "\n\n--- CURRENT WORLD STATE ---\n" + contextBlock },
      ...chatHistory,
    ];

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://st-ambrose-hospital.internal",
          "X-Title": "Dr. Gambling Chat",
        },
        body: JSON.stringify({
          model: "anthropic/claude-sonnet-4",
          messages,
          max_tokens: 300,
          temperature: 0.85,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error(`OpenRouter error: ${response.status} ${err}`);
        return;
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content;

      if (!reply) {
        console.error("No reply from OpenRouter");
        return;
      }

      // Post Dr. Gambling's response to chat
      await ctx.runMutation(api.chat.send, {
        sender: "Dr. Gambling",
        content: reply.trim(),
        messageType: "text",
      });

      // Occasionally write a private note about what just happened
      // (~30% chance, to keep it interesting but not spammy)
      if (Math.random() < 0.3) {
        const noteMessages = [
          {
            role: "system" as const,
            content: `You are Dr. Bruno Gambling. You just responded to a message in the group chat. Now write a SHORT private note (1-3 sentences) in your personal files about what just happened. Be candid — these are YOUR private notes that nobody else can see. Include the dark calculations, the real thoughts, the stuff you'd never say out loud. Be specific about names, trades, and money.

Choose a type for this note:
- "insight" if you noticed something medically/financially interesting
- "grudge" if someone annoyed you
- "trade_thesis" if it relates to a position
- "note" for general observations

Respond in JSON format: {"type": "...", "title": "...", "content": "..."}`
          },
          { role: "user" as const, content: `Context:\n${contextBlock}\n\nThe chat message you just responded to: [${lastMsg.sender}]: ${lastMsg.content}\n\nYour response: ${reply.trim()}` },
        ];

        const noteResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://st-ambrose-hospital.internal",
            "X-Title": "Dr. Gambling Notes",
          },
          body: JSON.stringify({
            model: "anthropic/claude-sonnet-4",
            messages: noteMessages,
            max_tokens: 200,
            temperature: 0.9,
          }),
        });

        if (noteResponse.ok) {
          const noteData = await noteResponse.json();
          const noteText = noteData.choices?.[0]?.message?.content;
          if (noteText) {
            try {
              // Try to parse JSON from the response
              const jsonMatch = noteText.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                const validTypes = ["note", "diagnosis", "insight", "grudge", "research", "trade_thesis"];
                const noteType = validTypes.includes(parsed.type) ? parsed.type : "note";
                await ctx.runMutation(api.agent.writeMemory, {
                  type: noteType as any,
                  title: parsed.title || "Untitled thought",
                  content: parsed.content || noteText,
                });
              }
            } catch {
              // If JSON parsing fails, just write it as a plain note
              await ctx.runMutation(api.agent.writeMemory, {
                type: "note",
                title: "Chat reflection",
                content: noteText,
              });
            }
          }
        }
      }
    } catch (err: any) {
      console.error(`Brain error: ${err.message}`);
    }
  },
});

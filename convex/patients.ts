import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const patients = await ctx.db.query("patients").collect();
    const result = [];
    for (const patient of patients) {
      const ceo = await ctx.db.get(patient.ceoId);
      result.push({ ...patient, ceo });
    }
    return result;
  },
});

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const patients = await ctx.db
      .query("patients")
      .withIndex("byStatus", (q) => q.eq("status", "active"))
      .collect();
    const result = [];
    for (const patient of patients) {
      const ceo = await ctx.db.get(patient.ceoId);
      result.push({ ...patient, ceo });
    }
    return result;
  },
});

export const get = query({
  args: { id: v.id("patients") },
  handler: async (ctx, { id }) => {
    const patient = await ctx.db.get(id);
    if (!patient) return null;
    const ceo = await ctx.db.get(patient.ceoId);
    return { ...patient, ceo };
  },
});

export const diagnose = mutation({
  args: {
    patientId: v.id("patients"),
    diagnosis: v.string(),
    confidence: v.number(),
    reasoning: v.string(),
  },
  handler: async (ctx, { patientId, diagnosis, confidence, reasoning }) => {
    const patient = await ctx.db.get(patientId);
    if (!patient) throw new Error("Patient not found");

    await ctx.db.patch(patientId, {
      diagnosis,
      diagnosisConfidence: confidence,
      diagnosisReasoning: reasoning,
    });

    // Also log as an agent memory
    const state = await ctx.db.query("simulationState").first();
    await ctx.db.insert("agentMemories", {
      type: "diagnosis",
      title: `Diagnosis: ${diagnosis}`,
      content: `Patient ${patientId}. Confidence: ${(confidence * 100).toFixed(0)}%. Reasoning: ${reasoning}`,
      simTime: state?.simTime ?? Date.now(),
      createdAt: Date.now(),
    });

    return { status: "diagnosed", diagnosis, confidence };
  },
});

// Admit a new CEO as a patient
export const admit = mutation({
  args: {
    ceoId: v.id("ceos"),
    presentingComplaint: v.string(),
    severity: v.number(),
  },
  handler: async (ctx, { ceoId, presentingComplaint, severity }) => {
    const ceo = await ctx.db.get(ceoId);
    if (!ceo) throw new Error("CEO not found");

    const state = await ctx.db.query("simulationState").first();
    const simTime = state?.simTime ?? Date.now();

    await ctx.db.patch(ceoId, { status: "critical" });

    return await ctx.db.insert("patients", {
      ceoId,
      presentingComplaint,
      severity,
      trajectory: "declining",
      vitals: [
        {
          simTime,
          heartRate: 88 + Math.floor(Math.random() * 30),
          bloodPressure: `${140 + Math.floor(Math.random() * 30)}/${80 + Math.floor(Math.random() * 20)}`,
          temperature: 37.0 + Math.random() * 1.5,
          oxygenSaturation: 88 + Math.floor(Math.random() * 8),
        },
      ],
      status: "active",
      admittedAt: simTime,
    });
  },
});

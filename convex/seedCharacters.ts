import { mutation } from "./_generated/server";

// =============================================================================
// SEED CHARACTERS — Hospital staff for the cafeteria picker
// Run with: npx convex run seedCharacters:seedCharacters
// =============================================================================

const CHARACTERS = [
  { name: "Dr. Helen Kowalski", role: "Chief of Medicine", imagePath: "/images/dr-kowalski.png" },
  { name: "Dr. Priya Yuen", role: "Cardiologist", imagePath: "/images/dr-yuen.png" },
  { name: "Dr. Ananya Patel", role: "Neurologist", imagePath: "/images/dr-patel.png" },
  { name: "Dr. James Whitfield", role: "Orthopedic Surgeon", imagePath: "/images/staff-whitfield.png" },
  { name: "Dr. Susan Chen", role: "Oncologist", imagePath: "/images/staff-chen.png" },
  { name: "Dr. Marcus Rivera", role: "Emergency Medicine", imagePath: "/images/staff-rivera.png" },
  { name: "Dr. Linda Okafor", role: "Pulmonologist", imagePath: "/images/staff-okafor.png" },
  { name: "Nurse Ray Tanaka", role: "Head Nurse, ICU", imagePath: "/images/staff-tanaka.png" },
  { name: "Nurse Deborah Simms", role: "Nurse Practitioner", imagePath: "/images/staff-simms.png" },
  { name: "Frank Callahan", role: "Hospital Administrator", imagePath: "/images/staff-callahan.png" },
  { name: "Theresa Voss", role: "Lab Technician", imagePath: "/images/staff-voss.png" },
  { name: "Dr. Robert Hargrove", role: "Anesthesiologist", imagePath: "/images/staff-hargrove.png" },
  { name: "Janet Moreau", role: "Radiology Tech", imagePath: "/images/staff-moreau.png" },
];

export const seedCharacters = mutation({
  args: {},
  handler: async (ctx) => {
    // Idempotent: skip if table non-empty
    const existing = await ctx.db.query("characters").first();
    if (existing) {
      return { status: "already_seeded", count: 0 };
    }

    for (const char of CHARACTERS) {
      await ctx.db.insert("characters", char);
    }

    return { status: "seeded", count: CHARACTERS.length };
  },
});

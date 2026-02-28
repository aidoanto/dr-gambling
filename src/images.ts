// =============================================================================
// Image mappings for character portraits and hospital imagery
// Generated with Google Gemini 3.1 Flash "Nano Banana 2" in LA Law style
// =============================================================================

// CEO last name → portrait filename
const CEO_IMAGES: Record<string, string> = {
  thornberry: "/images/ceo-thornberry.png",
  "zhao-mitchell": "/images/ceo-zhao-mitchell.png",
  crampton: "/images/ceo-crampton.png",
  chakraborty: "/images/ceo-chakraborty.png",
  pendergast: "/images/ceo-pendergast.png",
  engstrom: "/images/ceo-engstrom.png",
  jackson: "/images/ceo-jackson.png",
};

// Doctor/staff name → portrait filename
const DOCTOR_IMAGES: Record<string, string> = {
  "Dr. Gambling": "/images/dr-gambling.png",
  "Dr. Helen Kowalski": "/images/dr-kowalski.png",
  "Dr. Priya Yuen": "/images/dr-yuen.png",
  "Dr. Ananya Patel": "/images/dr-patel.png",
  "Dr. James Whitfield": "/images/staff-whitfield.png",
  "Dr. Susan Chen": "/images/staff-chen.png",
  "Dr. Marcus Rivera": "/images/staff-rivera.png",
  "Dr. Linda Okafor": "/images/staff-okafor.png",
  "Nurse Ray Tanaka": "/images/staff-tanaka.png",
  "Nurse Deborah Simms": "/images/staff-simms.png",
  "Frank Callahan": "/images/staff-callahan.png",
  "Theresa Voss": "/images/staff-voss.png",
  "Dr. Robert Hargrove": "/images/staff-hargrove.png",
  "Janet Moreau": "/images/staff-moreau.png",
  // Legacy short names (for old chat messages)
  "Dr. Kowalski": "/images/dr-kowalski.png",
  "Dr. Yuen": "/images/dr-yuen.png",
  "Dr. Patel": "/images/dr-patel.png",
};

export function getCeoImage(name: string): string | undefined {
  const lower = name.toLowerCase();
  for (const [key, path] of Object.entries(CEO_IMAGES)) {
    if (lower.includes(key)) return path;
  }
  return undefined;
}

export function getDoctorImage(sender: string): string | undefined {
  return DOCTOR_IMAGES[sender];
}

export const HOSPITAL_EXTERIOR = "/images/hospital-exterior.png";
export const HOSPITAL_INTERIOR = "/images/hospital-interior.png";

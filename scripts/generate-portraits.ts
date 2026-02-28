import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const MODEL = "gemini-2.0-flash-exp-image-generation";

const CHARACTERS = [
  {
    filename: "staff-whitfield",
    prompt: "Dr. James Whitfield, male, white, mid-50s, orthopedic surgeon, strong build, short gray hair, confident square jaw, wire-rimmed glasses, white coat over blue scrubs, name badge reading WHITFIELD M.D., standing in a hospital corridor",
  },
  {
    filename: "staff-chen",
    prompt: "Dr. Susan Chen, female, Chinese-American, mid-40s, oncologist, kind face, shoulder-length black hair, pearl earrings, white coat, stethoscope around neck, name badge reading CHEN M.D., seated at a desk with medical charts",
  },
  {
    filename: "staff-rivera",
    prompt: "Dr. Marcus Rivera, male, Latino, late 30s, emergency medicine physician, athletic build, short dark hair, stubble, intense focused expression, blue scrubs with white coat draped over arm, name badge, in an ER setting",
  },
  {
    filename: "staff-okafor",
    prompt: "Dr. Linda Okafor, female, Nigerian-American, early 50s, pulmonologist, warm motherly face, natural hair in a low bun, reading glasses on a chain, white coat, name badge reading OKAFOR M.D., in a hospital office",
  },
  {
    filename: "staff-tanaka",
    prompt: "Nurse Ray Tanaka, male, Japanese-American, mid-40s, head nurse of ICU, calm competent expression, short neat black hair, teal scrubs, name badge reading TANAKA R.N., standing in an ICU ward with monitors behind",
  },
  {
    filename: "staff-simms",
    prompt: "Nurse Deborah Simms, female, Black American, late 40s, nurse practitioner, warm confident smile, short natural hair, teal scrubs with white jacket, name badge reading SIMMS N.P., in a hospital hallway",
  },
  {
    filename: "staff-callahan",
    prompt: "Frank Callahan, male, Irish-American, early 60s, hospital administrator, slightly overweight, receding red-gray hair, wearing a dress shirt and tie with no white coat, name badge, holding a clipboard, in a hospital office",
  },
  {
    filename: "staff-voss",
    prompt: "Theresa Voss, female, German-American, mid-30s, lab technician, precise analytical look, blonde hair pulled back tightly, safety glasses pushed up on forehead, lab coat, name badge reading VOSS, in a hospital laboratory",
  },
  {
    filename: "staff-hargrove",
    prompt: "Dr. Robert Hargrove, male, Black American, late 50s, anesthesiologist, distinguished silver temples, warm tired eyes, surgical cap pushed back, white coat, name badge reading HARGROVE M.D., near an operating room",
  },
  {
    filename: "staff-moreau",
    prompt: "Janet Moreau, female, French-Canadian American, early 40s, radiology technician, practical no-nonsense look, auburn hair in a ponytail, navy scrubs, name badge reading MOREAU, standing next to medical imaging equipment",
  },
];

const STYLE_PREFIX =
  "Photorealistic portrait, chest-up shot, late 1980s early 1990s NBC medical drama aesthetic like St. Elsewhere or ER season 1. Warm hospital lighting, slightly cinematic film grain. Normal-looking real person, not a model. ";

async function generatePortrait(char: (typeof CHARACTERS)[number]) {
  const outputPath = path.join("public/images", `${char.filename}.png`);

  if (fs.existsSync(outputPath)) {
    console.log(`SKIP: ${outputPath} already exists`);
    return;
  }

  console.log(`Generating: ${char.filename}...`);

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: STYLE_PREFIX + char.prompt,
    config: {
      responseModalities: ["image", "text"],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (parts) {
    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith("image/")) {
        const buffer = Buffer.from(part.inlineData.data!, "base64");
        fs.writeFileSync(outputPath, buffer);
        console.log(`  Saved: ${outputPath} (${buffer.length} bytes)`);
        return;
      }
    }
  }
  console.error(`  FAILED: No image generated for ${char.filename}`);
}

async function main() {
  console.log("Generating 10 character portraits with Gemini Imagen...\n");

  for (const char of CHARACTERS) {
    try {
      await generatePortrait(char);
    } catch (e) {
      console.error(`  ERROR generating ${char.filename}:`, e);
    }
  }

  console.log("\nDone!");
}

main();

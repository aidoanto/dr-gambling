// =============================================================================
// Generate character portraits and hospital imagery for Dr. Gambling
// Style: LA Law / early 90s premium NBC drama
// Uses: Google Gemini 3.1 Flash Image Preview ("Nano Banana 2")
// =============================================================================

import { GoogleGenAI } from "@google/genai";
import { writeFileSync, mkdirSync, existsSync } from "fs";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY env var required");
const MODEL = "gemini-3.1-flash-image-preview"; // Nano Banana 2

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const OUTPUT_DIR = "public/images";
mkdirSync(OUTPUT_DIR, { recursive: true });

const STYLE_PREFIX = `Photorealistic portrait photograph in the style of a 1991 NBC prestige drama like LA Law or ER. Warm amber studio lighting, soft focus background, slightly glamorous but professional. Shot on 35mm film with subtle grain. Rich warm color palette — deep mahogany, warm gold, navy blue tones. The subject is framed from chest up, looking slightly off-camera with a confident expression. Professional studio backdrop.`;

const IMAGES = [
  {
    filename: "dr-gambling.png",
    prompt: `${STYLE_PREFIX} A man in his late 40s, intense dark eyes, disheveled but expensive hair, wearing a rumpled white doctor's coat over a surprisingly nice shirt and loosened tie. He has the look of someone who is simultaneously the smartest and most unhinged person in any room. Slight smirk. Badge reads "B. GAMBLING M.D." There's a Bloomberg terminal reflected faintly in his glasses.`,
  },
  {
    filename: "dr-kowalski.png",
    prompt: `${STYLE_PREFIX} A woman in her mid-50s, sharp features, graying hair pulled back tightly, reading glasses perched on her nose. She wears a pristine white coat with perfect posture. She has the exhausted, furious expression of someone who has been looking at a pension statement. Eastern European features. Badge reads "KOWALSKI M.D."`,
  },
  {
    filename: "dr-yuen.png",
    prompt: `${STYLE_PREFIX} An East Asian man in his early 40s, calm and measured expression, well-groomed, wearing a perfectly pressed white coat and tasteful tie. He has the patient, slightly disappointed look of someone who keeps trying to reason with an unreasonable person. Wire-frame glasses. Badge reads "YUEN M.D."`,
  },
  {
    filename: "dr-patel.png",
    prompt: `${STYLE_PREFIX} A South Asian woman in her early 30s, bright eyes, eager face that alternates between being deeply impressed and deeply horrified. She's the newest attending, still idealistic. Neat white coat, stethoscope around neck. Badge reads "PATEL M.D." She looks like she just heard something that changed her understanding of medical ethics.`,
  },
  {
    filename: "ceo-thornberry.png",
    prompt: `${STYLE_PREFIX} A heavyset white man in his late 60s, ruddy complexion, wearing an expensive but ill-fitting navy suit. He looks like he owns pharmaceutical companies and eats at steakhouses. Thinning silver hair, large gold watch, slightly sweaty. Red-faced. The picture of corporate wealth meeting cardiovascular risk.`,
  },
  {
    filename: "ceo-zhao-mitchell.png",
    prompt: `${STYLE_PREFIX} An East Asian woman in her early 50s, striking and intense, wearing a minimalist black turtleneck. She has the sharp, sleep-deprived look of a tech CEO who runs an AI company. Dark circles under piercing eyes, but impeccably styled. She radiates both brilliance and the effects of 12 daily espressos.`,
  },
  {
    filename: "ceo-crampton.png",
    prompt: `${STYLE_PREFIX} A weathered white man in his mid-70s, military bearing despite visible illness. He wears a worn leather jacket over a hospital gown. Oxygen cannula in his nose but defiant expression. Vietnam-era tattoo visible on forearm. He looks like he has threatened at least three cardiologists this week. Silver crew cut.`,
  },
  {
    filename: "ceo-chakraborty.png",
    prompt: `${STYLE_PREFIX} A South Asian woman in her mid-40s, fit and healthy-looking, wearing athletic wear under a blazer. She's an ultramarathon runner who runs a pharma company. Bright, confident expression. She is frustratingly healthy and this would annoy Dr. Gambling immensely. Warm smile.`,
  },
  {
    filename: "ceo-pendergast.png",
    prompt: `${STYLE_PREFIX} A very large white man in his early 70s, jovial but clearly unwell. He wears a Hawaiian shirt that barely contains him. He owns 14 fast food franchises and eats at all of them. Ruddy face, labored breathing visible. A man who has made his cardiologist give up. But he looks happy about it.`,
  },
  {
    filename: "ceo-engstrom.png",
    prompt: `${STYLE_PREFIX} A Scandinavian woman in her early 60s, elegant but gaunt. She's lost weight recently and you can see it in how her expensive blazer hangs slightly loose. Nordic features, silver-blonde hair, dignified expression masking worry. She looks like a mining executive who used to be a competitive cross-country skier. Haunted eyes.`,
  },
  {
    filename: "ceo-jackson.png",
    prompt: `${STYLE_PREFIX} A Black man in his late 50s, former rapper turned entertainment mogul. He wears a custom suit with subtle gold accents. Charismatic face, warm eyes, but you can tell his heart isn't great — slight breathlessness in his posture. Multiple rings. He looks like he's about to either sign a deal or perform at a charity gala.`,
  },
  {
    filename: "hospital-exterior.png",
    prompt: `Exterior photograph of a large teaching hospital in the style of a 1991 NBC prestige drama. Shot on 35mm film. The building is a brutalist concrete and glass tower, softened by mature trees and warm golden-hour lighting. A sign reads "ST. AMBROSE TEACHING HOSPITAL". Cars from the early 90s in the parking lot but the building itself is timeless. Warm amber tones, slight film grain, cinematic composition.`,
  },
  {
    filename: "hospital-interior.png",
    prompt: `Interior photograph of a hospital office/workstation in the style of a 1991 NBC prestige drama like LA Law. Warm amber lighting, wood-paneled walls mixed with medical equipment. Multiple computer monitors showing stock charts and medical data. Messy desk with papers, coffee cups, and a Bloomberg terminal. There's a framed medical diploma next to a printed stock chart on the wall. 35mm film look, warm color palette, cinematic.`,
  },
];

async function generateImage(item) {
  console.log(`Generating: ${item.filename}...`);

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{
        role: "user",
        parts: [{ text: item.prompt }]
      }],
      config: {
        responseModalities: ["image", "text"],
      },
    });

    if (response.candidates && response.candidates[0]) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData) {
          const buffer = Buffer.from(part.inlineData.data, "base64");
          const path = `${OUTPUT_DIR}/${item.filename}`;
          writeFileSync(path, buffer);
          console.log(`  Saved: ${path} (${(buffer.length / 1024).toFixed(0)}KB)`);
          return true;
        }
      }
    }

    console.log(`  Warning: No image in response for ${item.filename}`);
    console.log(`  Response text: ${JSON.stringify(response.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean))}`);
    return false;
  } catch (err) {
    console.error(`  Error generating ${item.filename}: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log("=== Dr. Gambling Image Generator ===");
  console.log(`Model: ${MODEL}`);
  console.log(`Output: ${OUTPUT_DIR}/`);
  console.log(`Images to generate: ${IMAGES.length}`);
  console.log("");

  let success = 0;
  let failed = 0;

  for (const item of IMAGES) {
    // Check if already exists
    if (existsSync(`${OUTPUT_DIR}/${item.filename}`)) {
      console.log(`Skipping ${item.filename} (already exists)`);
      success++;
      continue;
    }

    const ok = await generateImage(item);
    if (ok) {
      success++;
    } else {
      failed++;
    }

    // Rate limit: small delay between requests
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("");
  console.log(`Done! ${success} succeeded, ${failed} failed.`);
}

main().catch(console.error);

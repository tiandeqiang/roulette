import { GoogleGenAI } from "@google/genai";
import { SpinResult, PrizeTier } from "../types";

const initGenAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzePerformance = async (
  history: SpinResult[],
  tiers: PrizeTier[]
): Promise<string> => {
  const ai = initGenAI();
  if (!ai) return "API Key is missing. Unable to generate report.";

  const totalSpins = history.length;
  if (totalSpins === 0) return "No data available for analysis.";

  const totalPayout = history.reduce((acc, curr) => acc + curr.prizeValue, 0);
  const avgPayout = totalPayout / totalSpins;

  // Calculate distribution
  const distribution: Record<string, number> = {};
  history.forEach(spin => {
    distribution[spin.prizeLabel] = (distribution[spin.prizeLabel] || 0) + 1;
  });

  const prompt = `
    You are a Senior Business Analyst for a casino/gaming company.
    Analyze the following Roulette Machine performance data.

    **Configuration (Expected Probabilities):**
    ${tiers.map(t => `- ${t.label}: ${(t.probability * 100).toFixed(1)}%`).join('\n')}

    **Actual Performance Data (Last ${totalSpins} spins):**
    - Total Payout: $${totalPayout}
    - Average Payout per Spin: $${avgPayout.toFixed(2)}
    - Win Counts by Tier: ${JSON.stringify(distribution)}

    **Task:**
    1. Compare actual results vs expected probabilities. Is the machine running "hot" (paying too much) or "cold"?
    2. Provide a brief financial summary for the business owner.
    3. Give a recommendation (e.g., check mechanism, run promotion, keep as is).

    Keep the tone professional, concise, and insightful. Use Markdown formatting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Fast response needed
      }
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Failed to generate analysis due to an error.";
  }
};
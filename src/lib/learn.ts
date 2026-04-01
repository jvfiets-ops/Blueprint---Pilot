/**
 * Send learning insights to the memory system.
 * Call this from any module after a user saves meaningful data.
 * This enables the AI coach to learn about the user across all touchpoints.
 */
export async function sendInsights(
  source: string,
  insights: {
    themes?: string[];
    strengths?: string[];
    challenges?: string[];
    values?: string[];
    goals?: string[];
    personality_traits?: string[];
  }
) {
  try {
    await fetch("/api/learn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, insights }),
    });
  } catch {
    // Non-blocking — learning is best-effort
  }
}

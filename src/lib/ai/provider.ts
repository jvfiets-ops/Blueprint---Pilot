export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface AIProvider {
  chat(messages: Message[], systemPrompt: string): AsyncIterable<string>;
}

export interface UserAISettings {
  provider: "anthropic" | "openai";
  encryptedApiKey: string | null;
  modelOverride: string | null;
}

// Scripted fallback when no API key is configured
class ScriptedProvider implements AIProvider {
  async *chat(messages: Message[]): AsyncIterable<string> {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const userText = lastUser?.content.toLowerCase() ?? "";
    const msgCount = messages.filter((m) => m.role === "assistant").length;

    let reply: string;
    if (msgCount === 0) {
      reply = "Bedankt dat je dit deelt. Kun je daar iets meer over vertellen? Wat speelt er precies?";
    } else if (msgCount === 1) {
      reply = userText.includes("stress") || userText.includes("druk")
        ? "Ik hoor dat er druk is. Wat zou er voor jou veranderen als die druk er even niet was?"
        : "Interessant. Wat maakt dat dit nu zo aanwezig is voor je?";
    } else if (msgCount === 2) {
      reply = "Wat zou je morgen anders willen doen op basis van wat je nu voelt?";
    } else {
      reply = "Goed dat je hier bewust mee bezig bent. Dat is al een stap. Wil je nog ergens dieper op ingaan?";
    }

    // Simulate streaming
    const words = reply.split(" ");
    for (const word of words) {
      yield word + " ";
      await new Promise((r) => setTimeout(r, 30));
    }
  }
}

export function getProvider(
  settings: UserAISettings | null,
  decryptedKey?: string
): AIProvider {
  if (settings && decryptedKey) {
    if (settings.provider === "openai") {
      const { OpenAIProvider } = require("./openai");
      return new OpenAIProvider(decryptedKey, settings.modelOverride ?? "gpt-4o");
    }
    const { AnthropicProvider } = require("./anthropic");
    return new AnthropicProvider(decryptedKey, settings.modelOverride ?? "claude-sonnet-4-20250514");
  }
  // Fallback: central demo key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return new ScriptedProvider();
  const { AnthropicProvider } = require("./anthropic");
  return new AnthropicProvider(apiKey, "claude-sonnet-4-20250514");
}

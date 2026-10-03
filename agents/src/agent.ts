import { GoogleGenAI, mcpToTool } from "@google/genai";
import type { Content } from "@google/genai";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";

export interface AgentOptions {
  name: string;
  systemInstruction: string;
  model?: string;
  mcpClients?: Client[];
  apiKey?: string;
}

export interface ResearchResult {
  text: string;
  sources: { title?: string; uri?: string }[];
}

export class Agent {
  readonly name: string;
  private readonly ai: GoogleGenAI;
  private readonly systemInstruction: string;
  private readonly model: string;
  private readonly mcpClients: Client[];

  constructor(opts: AgentOptions) {
    this.name = opts.name;
    this.systemInstruction = opts.systemInstruction;
    this.model = opts.model ?? "gemini-2.5-flash";
    this.mcpClients = opts.mcpClients ?? [];
    this.ai = new GoogleGenAI({
      apiKey: opts.apiKey ?? process.env.GEMINI_API_KEY,
    });
  }

  /**
   * Single-turn ask. MCP tools are converted to Gemini function
   * declarations via mcpToTool and executed through automatic function
   * calling. Pass prior turns in `history` for multi-turn use.
   */
  async ask(prompt: string, history: Content[] = []): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: [
        ...history,
        { role: "user", parts: [{ text: prompt }] },
      ],
      config: {
        systemInstruction: this.systemInstruction,
        tools: this.mcpClients.length
          ? [mcpToTool(...this.mcpClients, {})]
          : undefined,
      },
    });
    return response.text ?? "";
  }

  /**
   * Grounded web research via Google Search. Kept as its own call because
   * the API doesn't allow mixing googleSearch with function/MCP tools in
   * one request. Returns the answer text plus cited source URLs.
   */
  async research(prompt: string): Promise<ResearchResult> {
    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        systemInstruction: this.systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });
    const chunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const sources = chunks
      .map((c) => c.web)
      .filter((w): w is { title?: string; uri?: string } => w != null);
    return { text: response.text ?? "", sources };
  }

  /**
   * Turn unstructured text into typed JSON using a response schema.
   * Deterministic second phase after research() — no tools needed.
   */
  async extractJson<T>(
    instruction: string,
    sourceText: string,
    responseJsonSchema: Record<string, unknown>,
  ): Promise<T> {
    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: `${instruction}\n\nSOURCE TEXT:\n${sourceText}`,
      config: {
        systemInstruction: this.systemInstruction,
        responseMimeType: "application/json",
        responseJsonSchema,
      },
    });
    return JSON.parse(response.text ?? "null") as T;
  }
}

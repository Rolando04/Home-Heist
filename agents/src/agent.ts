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
   * Grounded web research via Google Search + URL Context (the model can
   * fetch and read the pages it finds — essential for rate tables living
   * on lender sites). Kept as its own call because the API doesn't allow
   * mixing grounding tools with function/MCP tools in one request.
   * Returns the answer text plus cited/retrieved source URLs.
   */
  async research(prompt: string): Promise<ResearchResult> {
    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        systemInstruction: this.systemInstruction,
        tools: [{ googleSearch: {} }, { urlContext: {} }],
      },
    });
    const candidate = response.candidates?.[0];
    const chunks = candidate?.groundingMetadata?.groundingChunks ?? [];
    const sources = chunks
      .map((c) => c.web)
      .filter((w): w is { title?: string; uri?: string } => w != null);
    const retrieved =
      candidate?.urlContextMetadata?.urlMetadata ?? [];
    for (const r of retrieved) {
      if (r.retrievedUrl) sources.push({ uri: r.retrievedUrl });
    }
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

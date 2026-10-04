import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export type McpServerSpec =
  | {
      transport: "stdio";
      command: string;
      args?: string[];
      env?: Record<string, string>;
    }
  | {
      transport: "http";
      url: string;
      headers?: Record<string, string>;
    };

/**
 * Connect an MCP client to a server. For OAuth-protected remote servers
 * (Linear, Notion, ...), use a stdio spec pointing at `mcp-remote` — it
 * proxies Streamable HTTP over stdio and runs the OAuth browser flow on
 * first connect, caching tokens under ~/.mcp-auth.
 */
export async function connectMcpClient(
  name: string,
  spec: McpServerSpec,
): Promise<Client> {
  const client = new Client({ name: `home-heist/${name}`, version: "0.1.0" });

  if (spec.transport === "stdio") {
    await client.connect(
      new StdioClientTransport({
        command: spec.command,
        args: spec.args ?? [],
        env: { ...process.env, ...(spec.env ?? {}) } as Record<string, string>,
      }),
    );
  } else {
    await client.connect(
      new StreamableHTTPClientTransport(new URL(spec.url), {
        requestInit: spec.headers ? { headers: spec.headers } : undefined,
      }),
    );
  }

  return client;
}

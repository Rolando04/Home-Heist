# Home-Heist Agents

TypeScript harness for Gemini-powered agents that call MCP tools
(Linear wired in by default).

## Setup

```bash
npm install
cp .env.example .env   # then put your Gemini API key in .env
```

## Run

```bash
npm run dev -- "List my Linear teams"
# or pass any prompt as the argument
```

First run triggers a Linear OAuth flow in the browser (via `mcp-remote`);
tokens are cached in `~/.mcp-auth` afterwards.

## Pieces

- `src/mcp.ts` — `connectMcpClient(name, spec)`; stdio specs and HTTP
  specs. OAuth-protected remote servers go through `mcp-remote`.
- `src/agent.ts` — `Agent` class; wraps `@google/genai`, converts MCP
  tools to Gemini function declarations via `mcpToTool`, automatic
  function calling executes them.
- `src/index.ts` — demo: connects Linear, creates an agent, answers a
  prompt.

## Adding more MCP servers

```ts
const extra = await connectMcpClient("name", {
  transport: "stdio",
  command: "npx",
  args: ["-y", "some-mcp-server"],
});

const agent = new Agent({ ..., mcpClients: [linear, extra] });
```

For a remote server with a static token use `transport: "http"` with
`url` and `headers`. For an OAuth remote server, proxy it with
`npx -y mcp-remote <url>` as a stdio spec.

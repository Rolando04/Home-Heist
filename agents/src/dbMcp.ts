import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { z } from "zod";
import {
  listInstitutions,
  logSearch,
  searchLoans,
  type BorrowerProfile,
} from "./db.js";

/**
 * Exposes the Postgres data layer as an MCP server, connected in-process
 * via a linked transport pair. The returned client can be handed to
 * mcpToTool() so the main agent queries the DB through MCP.
 */
export async function createDbMcpClient(): Promise<Client> {
  const server = new McpServer({
    name: "home-heist-db",
    version: "0.1.0",
  });

  server.tool(
    "search_loans",
    "Search mortgage products. Filters: borrower's credit score band, loan type, term, max APR. Returns products joined with institution name, ordered by APR.",
    {
      creditScore: z.number().int().optional(),
      loanType: z.string().optional(),
      termMonths: z.number().int().optional(),
      maxApr: z.number().optional(),
    },
    async (args) => ({
      content: [{ type: "text", text: JSON.stringify(await searchLoans(args), null, 2) }],
    }),
  );

  server.tool(
    "list_institutions",
    "List known mortgage lenders, optionally filtered by type (e.g. 'credit union').",
    { type: z.string().optional() },
    async ({ type }) => ({
      content: [{ type: "text", text: JSON.stringify(await listInstitutions(type), null, 2) }],
    }),
  );

  server.tool(
    "log_search",
    "Record a borrower's rate search in loan_search for history.",
    {
      income: z.number(),
      creditScore: z.number().int(),
      zip: z.string(),
      propertyPrice: z.number(),
      downPayment: z.number(),
      loanAmount: z.number(),
    },
    async (p) => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(
            await logSearch(null, p as BorrowerProfile),
          ),
        },
      ],
    }),
  );

  const [serverTransport, clientTransport] =
    InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  const client = new Client({ name: "home-heist/db-client", version: "0.1.0" });
  await client.connect(clientTransport);
  return client;
}

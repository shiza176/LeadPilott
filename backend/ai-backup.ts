import { Router, type IRouter } from "express";
import {
  and,
  eq,
  ilike,
  or,
} from "drizzle-orm";
import {
  db,
  companiesTable,
  searchHistoryTable,
} from "@workspace/db";

const router: IRouter = Router();

const OPENROUTER_URL =
  "https://openrouter.ai/api/v1/chat/completions";

function normalize(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function makeSourceId(
  name: string,
  city: string | null,
  country: string | null,
): string {
  return [
    name,
    city ?? "",
    country ?? "",
  ]
    .join("|")
    .toLowerCase()
    .replace(/[^a-z0-9|]+/g, "-");
}

function toCompanyResponse(company: any) {
  return {
    id: String(company.id),
    name: company.name,
    initials: company.name
      .split(/\s+/)
      .map((part: string) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    industry: company.industry ?? "Unknown",
    companyType: "Company",
    location: [company.city, company.country]
      .filter(Boolean)
      .join(", ") || "Unknown",
    size: company.size ?? "Unknown",
    website: company.website ?? "",
    linkedin: "",
    description: company.description ?? "",
    founded: company.founded ?? 0,
    peopleCount: 0,
    relevanceScore: 80,
  };
}


/* -----------------------------------------
   AI CHAT
----------------------------------------- */

router.post("/chat", async (req, res) => {
  try {
    const message = normalize(req.body?.message);

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENROUTER_API_KEY is not configured",
      });
    }

    const response = await fetch(
      OPENROUTER_URL,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "LeadPilot",
        },
        body: JSON.stringify({
          model: "openrouter/free",

          messages: [
            {
              role: "system",
              content:
                "You are LeadPilot AI Assistant. " +
                "You are a conversational assistant for lead generation. " +
                "Answer greetings naturally. " +
                "Help users understand lead generation, companies, search filters, prospecting and the LeadPilot application. " +
                "Do not use Google. " +
                "Do not call or mention external search tools. " +
                "Do not output tool-call syntax such as <|tool_call_start|>. " +
                "Give concise and practical answers.",
            },
            {
              role: "user",
              content: message,
            },
          ],
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter error:", data);

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "OpenRouter request failed",
      });
    }

    let answer =
      data?.choices?.[0]?.message?.content ||
      "I could not generate a response.";

    if (
      answer.includes("<|tool_call_start|>") ||
      answer.includes("<|tool_call_end|>")
    ) {
      answer =
        "I can help you with LeadPilot, lead generation, companies and search filters. What would you like to do?";
    }

    return res.json({
      answer,
    });
  } catch (error) {
    console.error("AI route error:", error);

    return res.status(500).json({
      error: "Failed to contact AI model",
    });
  }
});


/* -----------------------------------------
   AI COMPANY SEARCH
----------------------------------------- */

router.post("/search", async (req, res) => {
  try {
    const query = normalize(req.body?.query);
    const filters = req.body?.filters ?? {};

    if (!query) {
      return res.status(400).json({
        error: "Search query is required",
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENROUTER_API_KEY is not configured",
      });
    }

    const location = normalize(filters.location);
    const companySize = normalize(filters.companySize);

    const industries = Array.isArray(filters.industry)
      ? filters.industry.filter(
          (item: unknown) => typeof item === "string",
        )
      : [];

    /*
     * STEP 1:
     * Check the database first.
     *
     * If matching companies already exist,
     * reuse them instead of asking OpenRouter again.
     */

    const conditions = [];

    if (location) {
      conditions.push(
        or(
          ilike(companiesTable.city, `%${location}%`),
          ilike(companiesTable.country, `%${location}%`),
        ),
      );
    }

    if (companySize) {
      conditions.push(
        ilike(
          companiesTable.size,
          `%${companySize}%`,
        ),
      );
    }

    if (industries.length > 0) {
      conditions.push(
        or(
          ...industries.map((industry: string) =>
            ilike(
              companiesTable.industry,
              `%${industry}%`,
            ),
          ),
        ),
      );
    }

    let cachedCompanies: any[] = [];

    if (conditions.length > 0) {
      cachedCompanies = await db
        .select()
        .from(companiesTable)
        .where(and(...conditions))
        .limit(20);
    }

    if (cachedCompanies.length > 0) {
      await db.insert(searchHistoryTable).values({
        query,
        resultCount: cachedCompanies.length,
      });

      return res.json({
        companies: cachedCompanies.map(
          toCompanyResponse,
        ),
        cached: true,
      });
    }


    /*
     * STEP 2:
     * Ask OpenRouter.
     */

    const response = await fetch(
      OPENROUTER_URL,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "LeadPilot",
        },
        body: JSON.stringify({
          model: "openrouter/free",

          messages: [
            {
              role: "system",
              content:
                "You are the company-search engine for LeadPilot. " +
                "Return company information as JSON only. " +
                "Do not use Google, web search, Foursquare, n8n, LinkedIn search, or any external tool. " +
                "Use only information you already know from your model knowledge. " +
                "Never invent exact employee counts, websites, founding years or other facts. " +
                "If a field is not known, return null. " +
                "Return companies relevant to the user's query. " +
                "The results are AI knowledge and are not live-verified.",
            },
            {
              role: "user",
              content: JSON.stringify({
                query,
                filters,
              }),
            },
          ],

          response_format: {
            type: "json_schema",
            json_schema: {
              name: "company_search_results",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  companies: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: {
                          type: "string",
                        },
                        industry: {
                          type: ["string", "null"],
                        },
                        city: {
                          type: ["string", "null"],
                        },
                        country: {
                          type: ["string", "null"],
                        },
                        website: {
                          type: ["string", "null"],
                        },
                        description: {
                          type: ["string", "null"],
                        },
                        founded: {
                          type: ["integer", "null"],
                        },
                        size: {
                          type: ["string", "null"],
                        },
                      },
                      required: [
                        "name",
                        "industry",
                        "city",
                        "country",
                        "website",
                        "description",
                        "founded",
                        "size",
                      ],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["companies"],
                additionalProperties: false,
              },
            },
          },
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter search error:", data);

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "OpenRouter search failed",
      });
    }

    const rawContent =
      data?.choices?.[0]?.message?.content;

    if (!rawContent) {
      return res.status(502).json({
        error: "OpenRouter returned an empty response",
      });
    }

    let parsed;

    try {
      parsed =
        typeof rawContent === "string"
          ? JSON.parse(rawContent)
          : rawContent;
    } catch {
      return res.status(502).json({
        error:
          "OpenRouter returned invalid company JSON",
      });
    }

    const aiCompanies = Array.isArray(
      parsed?.companies,
    )
      ? parsed.companies
      : [];

    /*
     * STEP 3:
     * Save AI results in database.
     */

    for (const company of aiCompanies) {
      const name = normalize(company.name);

      if (!name) continue;

      const city =
        typeof company.city === "string"
          ? company.city
          : null;

      const country =
        typeof company.country === "string"
          ? company.country
          : null;

      const sourceId = makeSourceId(
        name,
        city,
        country,
      );

      await db
        .insert(companiesTable)
        .values({
          name,
          industry:
            company.industry ?? null,
          city,
          country,
          website:
            company.website ?? null,
          description:
            company.description ?? null,
          founded:
            company.founded ?? null,
          size:
            company.size ?? null,
          source: "openrouter",
          sourceId,
        })
        .onConflictDoNothing();
    }

    /*
     * STEP 4:
     * Record search history.
     */

    await db.insert(searchHistoryTable).values({
      query,
      resultCount: aiCompanies.length,
    });


    /*
     * STEP 5:
     * Return the saved records to frontend.
     */

    const savedCompanies = await db
      .select()
      .from(companiesTable)
      .where(
        or(
          ...aiCompanies
            .filter(
              (company: any) =>
                typeof company.name === "string",
            )
            .slice(0, 20)
            .map((company: any) =>
              eq(
                companiesTable.name,
                company.name,
              ),
            ),
        ),
      )
      .limit(20);

    return res.json({
      companies: savedCompanies.map(
        toCompanyResponse,
      ),
      cached: false,
    });
  } catch (error) {
    console.error(
      "AI company search error:",
      error,
    );

    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to search companies",
    });
  }
});

export default router;
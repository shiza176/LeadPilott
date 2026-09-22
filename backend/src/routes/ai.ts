import { Router, type IRouter } from "express";
import { and, eq, ilike, or } from "drizzle-orm";
import { db, companiesTable, searchHistoryTable } from "@workspace/db";

const router: IRouter = Router();

type OpenRouterResponse = {
  error?: {
    message?: string;
  };
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function normalize(value: unknown): string {
  return String(value ?? "").trim();
}

function makeSourceId(name: string, city: string): string {
  return `${normalize(name).toLowerCase()}-${normalize(city).toLowerCase()}`
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isValidApiKey(key?: string): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  return trimmed.length > 10 && !trimmed.startsWith("your_optional_");
}

/* =========================
   CHAT ASSISTANT ROUTE
========================= */

router.post("/chat", async (req, res) => {
  try {
    const message = normalize(req.body?.message);

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    // If valid OpenRouter key is present, make real OpenRouter call
    if (isValidApiKey(apiKey)) {
      try {
        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "http://localhost:5173",
              "X-Title": "LeadPilot",
            },
            body: JSON.stringify({
              model: "nvidia/nemotron-3.5-lightning:free",
              messages: [
                {
                  role: "system",
                  content:
                    "You are LeadPilot AI Assistant. Help users with lead generation, target companies, prospects, search filters, sales outreach, and business research. Respond helpfully and concisely.",
                },
                {
                  role: "user",
                  content: message,
                },
              ],
            }),
          },
        );

        const data = (await response.json()) as OpenRouterResponse;

        if (response.ok && data.choices?.[0]?.message?.content) {
          return res.json({ answer: data.choices[0].message.content });
        }
      } catch (err) {
        console.warn("OpenRouter API call error, falling back to local assistant:", err);
      }
    }

    // Intelligent local fallback assistant when OpenRouter API key is absent or placeholder
    const lowerMsg = message.toLowerCase();
    let answer = "";

    if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("hey")) {
      answer = "Hello! 👋 I am your LeadPilot AI Assistant. I can help you structure lead generation queries, suggest industry filters, or advise on prospecting strategies.";
    } else if (lowerMsg.includes("filter") || lowerMsg.includes("search")) {
      answer = "To get the best results on LeadPilot:\n1. Enter natural language phrases like 'SaaS companies in Lahore'\n2. Use the Industry, Location, and Company Size filters\n3. Switch between People and Companies views.";
    } else if (lowerMsg.includes("key") || lowerMsg.includes("openrouter") || lowerMsg.includes("api")) {
      answer = "To enable live OpenRouter LLM chat, get a free API key at https://openrouter.ai and set OPENROUTER_API_KEY=sk-or-v1-... in your `.env` and `backend/.env` files.";
    } else {
      answer = `LeadPilot Assistant Response: "${message}"\n\nI can help you build target company shortlists and refine lead search criteria. (Tip: Set a free OPENROUTER_API_KEY in your .env file to enable live LLM chat).`;
    }

    return res.json({ answer });
  } catch (error) {
    console.error("AI chat route error:", error);
    return res.status(500).json({ error: "Failed to process chat message" });
  }
});


/* =========================
   COMPANY SEARCH ROUTE
========================= */

router.post("/search", async (req, res) => {
  try {
    const query = normalize(req.body?.query);
    const filters = req.body?.filters ?? {};

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const location = normalize(filters.location);
    const companySize = normalize(filters.companySize);
    const industries: string[] = Array.isArray(filters.industries)
      ? filters.industries
          .map((ind: unknown) => normalize(ind))
          .filter((ind: string): ind is string => Boolean(ind))
      : [];

    const conditions = [];
    if (location) conditions.push(ilike(companiesTable.city, `%${location}%`));
    if (companySize) conditions.push(ilike(companiesTable.size, `%${companySize}%`));
    if (industries.length > 0) {
      conditions.push(or(...industries.map((ind) => ilike(companiesTable.industry, `%${ind}%`))));
    }

    // First check database cache
    const cachedCompanies = await db
      .select()
      .from(companiesTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(20);

    if (cachedCompanies.length > 0) {
      return res.json({
        companies: cachedCompanies.map((company) => ({
          id: String(company.id),
          name: company.name,
          initials: company.name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase(),
          industry: company.industry || "Business",
          companyType: "Company",
          location: [company.city, company.country].filter(Boolean).join(", ") || "Location unavailable",
          size: company.size || "Unknown",
          website: company.website || "",
          linkedin: "",
          description: company.description || `${company.name}.`,
          founded: company.founded || 0,
          peopleCount: 0,
          relevanceScore: 80,
        })),
        cached: true,
      });
    }

    // Call OpenRouter if valid key is set
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (isValidApiKey(apiKey)) {
      try {
        const prompt = `Find up to 10 companies relevant to this lead-generation search: "${query}". Location: ${location || "Any"}, Size: ${companySize || "Any"}. Return JSON only in format { "companies": [{ "name": "Company Name", "industry": "Industry", "city": "City", "country": "Country", "website": "Website", "description": "Desc", "founded": 2020, "size": "50-200" }] }`;
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "LeadPilot",
          },
          body: JSON.stringify({
            model: "nvidia/nemotron-3.5-lightning:free",
            messages: [
              { role: "system", content: "You return company search results as JSON only." },
              { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as OpenRouterResponse;
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            const aiCompanies = Array.isArray(parsed.companies) ? parsed.companies : [];
            const savedCompanies = [];

            for (const company of aiCompanies) {
              const name = normalize(company.name);
              if (!name) continue;
              const city = normalize(company.city);
              const country = normalize(company.country);
              const sourceId = makeSourceId(name, city);

              const existing = await db
                .select()
                .from(companiesTable)
                .where(and(eq(companiesTable.source, "openrouter"), eq(companiesTable.sourceId, sourceId)))
                .limit(1);

              let saved;
              if (existing.length > 0) {
                saved = existing[0];
              } else {
                const inserted = await db
                  .insert(companiesTable)
                  .values({
                    name,
                    industry: normalize(company.industry) || null,
                    city: city || null,
                    country: country || null,
                    website: normalize(company.website) || null,
                    description: normalize(company.description) || null,
                    founded: typeof company.founded === "number" ? company.founded : null,
                    size: normalize(company.size) || null,
                    source: "openrouter",
                    sourceId,
                  })
                  .returning();
                saved = inserted[0];
              }
              savedCompanies.push(saved);
            }

            if (savedCompanies.length > 0) {
              await db.insert(searchHistoryTable).values({
                query,
                filters,
                results: savedCompanies,
                resultCount: savedCompanies.length,
              });

              return res.json({
                companies: savedCompanies.map((company) => ({
                  id: String(company.id),
                  name: company.name,
                  initials: company.name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase(),
                  industry: company.industry || "Business",
                  companyType: "Company",
                  location: [company.city, company.country].filter(Boolean).join(", ") || "Location unavailable",
                  size: company.size || "Unknown",
                  website: company.website || "",
                  linkedin: "",
                  description: company.description || `${company.name}.`,
                  founded: company.founded || 0,
                  peopleCount: 0,
                  relevanceScore: 80,
                })),
                cached: false,
              });
            }
          }
        }
      } catch (err) {
        console.warn("OpenRouter search API error:", err);
      }
    }

    return res.json({ companies: [], cached: false });
  } catch (error) {
    console.error("AI search route error:", error);
    return res.status(500).json({ error: "Failed to perform company search" });
  }
});

export default router;
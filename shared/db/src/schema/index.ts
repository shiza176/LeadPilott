import { pgTable, serial, text, integer, timestamp, jsonb, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// COMPANIES — jo bhi search se milti hain, yahan store hoti hain
export const companiesTable = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  industry: text("industry"),  
  city: text("city"),
  country: text("country"),
  website: text("website"),
  description: text("description"),
  founded: integer("founded"),
  size: text("size"),
  // Kahan se aayi ye company (transparency ke liye, aur duplicate check ke liye)
  source: text("source").notNull(), // "openrouter-ai"
  sourceId: text("source_id"), // us source ka apna unique ID (duplicate rokne ke liye)
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Ek hi company baar baar insert na ho isi source se
  uniqueSource: unique().on(table.source, table.sourceId),
}));

// LEADS — company ke andar ke log (agar mile future mein Hunter.io se)
export const leadsTable = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title"),
  companyId: integer("company_id").references(() => companiesTable.id).notNull(),
  email: text("email"),
  linkedin: text("linkedin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueEmail: unique().on(table.email),
}));



// SAVED COMPANIES — abhi bina login ke, global save list
export const savedCompaniesTable = pgTable("saved_companies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  companyId: integer("company_id").references(() => companiesTable.id).notNull(),
  savedAt: timestamp("saved_at").defaultNow().notNull(),
});

// SAVED LEADS
export const savedLeadsTable = pgTable("saved_leads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  leadId: integer("lead_id").references(() => leadsTable.id).notNull(),
  savedAt: timestamp("saved_at").defaultNow().notNull(),
});

// SEARCH HISTORY — user ne kya search kiya
export const searchHistoryTable = pgTable("search_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  query: text("query").notNull(),
  filters: jsonb("filters"),
  results: jsonb("results"),
  resultCount: integer("result_count"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const insertCompanySchema = createInsertSchema(companiesTable).omit({ id: true, createdAt: true });
export const insertLeadSchema = createInsertSchema(leadsTable).omit({ id: true, createdAt: true });

export type Company = typeof companiesTable.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Lead = typeof leadsTable.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;


// USER SETTINGS — har user ki apni workspace preferences
export const userSettingsTable = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  workspace: text("workspace"),
  role: text("role"),
  defaultLocation: text("default_location"),
  resultsPerPage: integer("results_per_page").default(25),
  emailAlerts: integer("email_alerts").default(1), // 1 = true, 0 = false
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueUser: unique().on(table.userId),
}));

export type UserSettings = typeof userSettingsTable.$inferSelect;
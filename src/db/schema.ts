import { sql } from "drizzle-orm";
import {
  pgTable,
  integer,
  text,
  jsonb,
  serial,
  timestamp,
  bigint,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const advocates = pgTable("advocates", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  city: text("city").notNull(),
  degree: text("degree").notNull(),
  specialties: jsonb("payload").default([]).notNull(),
  yearsOfExperience: integer("years_of_experience").notNull(),
  phoneNumber: bigint("phone_number", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  // Composite index for name searches
  nameIdx: index("advocates_name_idx").on(table.firstName, table.lastName),
  // Individual indexes for common search fields
  cityIdx: index("advocates_city_idx").on(table.city),
  degreeIdx: index("advocates_degree_idx").on(table.degree),
  experienceIdx: index("advocates_experience_idx").on(table.yearsOfExperience),
  // GIN index for JSONB specialties for fast array searches
  specialtiesIdx: index("advocates_specialties_gin_idx").using("gin", table.specialties),
}));

export { advocates };

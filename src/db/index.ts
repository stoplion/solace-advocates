import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

const queryClient = postgres(process.env.DATABASE_URL, {
  max: 1, // Limit connection pool for development
})

const db = drizzle(queryClient)

export default db

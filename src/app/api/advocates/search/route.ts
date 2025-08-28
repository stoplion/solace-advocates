import type { SQL } from "drizzle-orm"
import { and, ilike, or, sql } from "drizzle-orm"
import { NextRequest } from "next/server"
import db from "../../../../db"
import { advocates } from "../../../../db/schema"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")?.trim()
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "20"))
    )
    const offset = (page - 1) * limit

    let whereConditions: SQL[] = []

    if (query && query.length > 0) {
      const searchTerms = query
        .toLowerCase()
        .split(/\s+/)
        .filter((term) => term.length > 0)

      // Build search conditions for each term
      const termConditions = searchTerms.map((term): SQL => {
        const searchPattern = `%${term}%`
        return or(
          ilike(advocates.firstName, searchPattern),
          ilike(advocates.lastName, searchPattern),
          ilike(advocates.city, searchPattern),
          ilike(advocates.degree, searchPattern),
          // Search in JSONB/number/text via casting, using ILIKE
          sql`${advocates.specialties}::text ILIKE ${searchPattern}`,
          sql`${advocates.yearsOfExperience}::text ILIKE ${searchPattern}`,
          sql`${advocates.phoneNumber}::text ILIKE ${searchPattern}`
        )
      })

      // All search terms must match (AND logic)
      whereConditions = termConditions
    }

    // Build the query with proper WHERE conditions
    const baseQuery = db.select().from(advocates)
    const queryWithWhere =
      whereConditions.length > 0
        ? baseQuery.where(and(...whereConditions))
        : baseQuery

    // Get paginated results
    const data = await queryWithWhere.limit(limit).offset(offset)

    // Get total count for pagination
    const countQuery =
      whereConditions.length > 0
        ? db
            .select({ count: sql<number>`count(*)` })
            .from(advocates)
            .where(and(...whereConditions))
        : db.select({ count: sql<number>`count(*)` }).from(advocates)

    const [{ count: totalCount }] = await countQuery

    return Response.json({
      data,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
      query: query || null,
    })
  } catch (error) {
    console.error("Search API error:", error)
    return Response.json(
      { error: "Internal server error", message: "Failed to search advocates" },
      { status: 500 }
    )
  }
}

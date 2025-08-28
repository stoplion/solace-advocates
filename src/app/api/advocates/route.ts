import { sql } from "drizzle-orm"
import { NextRequest } from "next/server"
import db from "../../../db"
import { advocates } from "../../../db/schema"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "20"))
    )
    const offset = (page - 1) * limit

    // Get paginated results
    const data = await db
      .select()
      .from(advocates)
      .limit(limit)
      .offset(offset)

    // Get total count
    const [{ count: totalCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(advocates)

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
    })
  } catch (error) {
    console.error("Advocates API error:", error)
    return Response.json(
      { error: "Internal server error", message: "Failed to fetch advocates" },
      { status: 500 }
    )
  }
}

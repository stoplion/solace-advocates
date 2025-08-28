import { sql } from "drizzle-orm"
import { NextRequest } from "next/server"
import db from "../../../db"
import { advocates } from "../../../db/schema"
import { validatePage, validateLimit, createValidationErrorResponse } from "../../../lib/validation"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Validate pagination parameters
    const pageValidation = validatePage(searchParams.get("page"))
    if (!pageValidation.isValid) {
      return createValidationErrorResponse(pageValidation.error!, pageValidation.code)
    }

    const limitValidation = validateLimit(searchParams.get("limit"))
    if (!limitValidation.isValid) {
      return createValidationErrorResponse(limitValidation.error!, limitValidation.code)
    }

    const page = pageValidation.value!
    const limit = limitValidation.value!
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
    // Log the full error for debugging (server-side only)
    console.error("Advocates API error:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    })
    
    // Return sanitized error to client
    return Response.json(
      { 
        error: "Internal server error", 
        message: "Failed to fetch advocates",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

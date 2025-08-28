import type { SQL } from 'drizzle-orm';
import { and, ilike, or, sql } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import db from '../../../../db';
import { advocates } from '../../../../db/schema';
import { validateSearchParams } from '../../../../lib/validation';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Validate all input parameters...
    const validation = validateSearchParams(searchParams);
    if (!validation.isValid) {
      return validation.response;
    }

    const { query, page, limit } = validation.values!;
    const offset = (page - 1) * limit;

    let whereConditions: SQL[] = [];

    if (query && query.length > 0) {
      const searchTerms = query
        .toLowerCase()
        .split(/\s+/)
        .filter((term) => term.length > 0);

      // Build search conditions for each term
      const termConditions = searchTerms.map((term): SQL => {
        const searchPattern = `%${term}%`;
        return or(
          ilike(advocates.firstName, searchPattern),
          ilike(advocates.lastName, searchPattern),
          ilike(advocates.city, searchPattern),
          ilike(advocates.degree, searchPattern),
          // Search in JSONB/number/text via casting, using ILIKE
          sql`${advocates.specialties}::text ILIKE ${searchPattern}`,
          sql`${advocates.yearsOfExperience}::text ILIKE ${searchPattern}`,
          sql`${advocates.phoneNumber}::text ILIKE ${searchPattern}`
        )!;
      });

      // All search terms must match (AND logic)
      whereConditions = termConditions;
    }

    // Build the query with proper WHERE conditions
    const baseQuery = db.select().from(advocates);
    const queryWithWhere =
      whereConditions.length > 0
        ? baseQuery.where(and(...whereConditions))
        : baseQuery;

    // Get paginated results
    const data = await queryWithWhere.limit(limit).offset(offset);

    // Get total count for pagination
    const countQuery =
      whereConditions.length > 0
        ? db
            .select({ count: sql<number>`count(*)` })
            .from(advocates)
            .where(and(...whereConditions))
        : db.select({ count: sql<number>`count(*)` }).from(advocates);

    const [{ count: totalCount }] = await countQuery;

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
    });
  } catch (error) {
    // Log the full error for debugging (server-side only)
    console.error('Search API error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
    
    // Return sanitized error to client
    return Response.json(
      { 
        error: 'Internal server error', 
        message: 'Failed to search advocates',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

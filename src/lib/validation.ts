// Input validation utilities for API endpoints

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  code?: string;
}

// Validation constants
export const VALIDATION_LIMITS = {
  QUERY_MAX_LENGTH: 100,
  QUERY_MIN_LENGTH: 1,
  MAX_SEARCH_TERMS: 10,
  PAGE_MIN: 1,
  PAGE_MAX: 1000,
  LIMIT_MIN: 1,
  LIMIT_MAX: 50,
} as const;

// Validation error codes
export const VALIDATION_CODES = {
  QUERY_TOO_LONG: 'QUERY_TOO_LONG',
  QUERY_TOO_SHORT: 'QUERY_TOO_SHORT',
  QUERY_INVALID_CHARS: 'QUERY_INVALID_CHARS',
  TOO_MANY_TERMS: 'TOO_MANY_TERMS',
  PAGE_OUT_OF_RANGE: 'PAGE_OUT_OF_RANGE',
  LIMIT_OUT_OF_RANGE: 'LIMIT_OUT_OF_RANGE',
  INVALID_NUMBER: 'INVALID_NUMBER',
} as const;

/**
 * Validates search query input
 */
export function validateSearchQuery(query: string | null | undefined): ValidationResult {
  // Allow empty/null queries
  if (!query || query.trim().length === 0) {
    return { isValid: true };
  }

  const trimmedQuery = query.trim();

  // Check length limits
  if (trimmedQuery.length > VALIDATION_LIMITS.QUERY_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Query too long (max ${VALIDATION_LIMITS.QUERY_MAX_LENGTH} characters)`,
      code: VALIDATION_CODES.QUERY_TOO_LONG,
    };
  }

  if (trimmedQuery.length < VALIDATION_LIMITS.QUERY_MIN_LENGTH) {
    return {
      isValid: false,
      error: `Query too short (min ${VALIDATION_LIMITS.QUERY_MIN_LENGTH} character)`,
      code: VALIDATION_CODES.QUERY_TOO_SHORT,
    };
  }

  // Check for potentially malicious patterns
  const suspiciousPatterns = [
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b/i, // SQL keywords
    /<script[^>]*>/i, // Script tags
    /javascript:/i, // JavaScript URLs
    /data:.*base64/i, // Data URLs
    /[<>{}[\]\\]/g, // Excessive special characters
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmedQuery)) {
      return {
        isValid: false,
        error: 'Query contains invalid characters or patterns',
        code: VALIDATION_CODES.QUERY_INVALID_CHARS,
      };
    }
  }

  // Check number of search terms
  const searchTerms = trimmedQuery
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 0);

  if (searchTerms.length > VALIDATION_LIMITS.MAX_SEARCH_TERMS) {
    return {
      isValid: false,
      error: `Too many search terms (max ${VALIDATION_LIMITS.MAX_SEARCH_TERMS})`,
      code: VALIDATION_CODES.TOO_MANY_TERMS,
    };
  }

  return { isValid: true };
}

/**
 * Validates and parses page parameter
 */
export function validatePage(pageParam: string | null): ValidationResult & { value?: number } {
  const defaultPage = VALIDATION_LIMITS.PAGE_MIN;

  if (!pageParam) {
    return { isValid: true, value: defaultPage };
  }

  const parsed = parseInt(pageParam);

  if (isNaN(parsed)) {
    return {
      isValid: false,
      error: 'Page must be a valid number',
      code: VALIDATION_CODES.INVALID_NUMBER,
    };
  }

  if (parsed < VALIDATION_LIMITS.PAGE_MIN || parsed > VALIDATION_LIMITS.PAGE_MAX) {
    return {
      isValid: false,
      error: `Page must be between ${VALIDATION_LIMITS.PAGE_MIN} and ${VALIDATION_LIMITS.PAGE_MAX}`,
      code: VALIDATION_CODES.PAGE_OUT_OF_RANGE,
    };
  }

  return { isValid: true, value: parsed };
}

/**
 * Validates and parses limit parameter
 */
export function validateLimit(limitParam: string | null): ValidationResult & { value?: number } {
  const defaultLimit = 20;

  if (!limitParam) {
    return { isValid: true, value: defaultLimit };
  }

  const parsed = parseInt(limitParam);

  if (isNaN(parsed)) {
    return {
      isValid: false,
      error: 'Limit must be a valid number',
      code: VALIDATION_CODES.INVALID_NUMBER,
    };
  }

  if (parsed < VALIDATION_LIMITS.LIMIT_MIN || parsed > VALIDATION_LIMITS.LIMIT_MAX) {
    return {
      isValid: false,
      error: `Limit must be between ${VALIDATION_LIMITS.LIMIT_MIN} and ${VALIDATION_LIMITS.LIMIT_MAX}`,
      code: VALIDATION_CODES.LIMIT_OUT_OF_RANGE,
    };
  }

  return { isValid: true, value: parsed };
}

/**
 * Sanitizes search query by removing potentially dangerous characters
 */
export function sanitizeQuery(query: string): string {
  return query
    .trim()
    // Remove control characters and non-printable characters
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove potential script injection attempts
    .replace(/<[^>]*>/g, '')
    // Remove backslashes to prevent escape attempts
    .replace(/\\/g, '');
}

/**
 * Creates a standardized validation error response
 */
export function createValidationErrorResponse(message: string, code?: string) {
  return Response.json(
    {
      error: 'Validation failed',
      message,
      code,
    },
    { status: 400 }
  );
}

/**
 * Validates all search endpoint parameters
 */
export function validateSearchParams(searchParams: URLSearchParams) {
  const query = searchParams.get('q');
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');

  // Validate query
  const queryValidation = validateSearchQuery(query);
  if (!queryValidation.isValid) {
    return { isValid: false, response: createValidationErrorResponse(queryValidation.error!, queryValidation.code) };
  }

  // Validate page
  const pageValidation = validatePage(page);
  if (!pageValidation.isValid) {
    return { isValid: false, response: createValidationErrorResponse(pageValidation.error!, pageValidation.code) };
  }

  // Validate limit
  const limitValidation = validateLimit(limit);
  if (!limitValidation.isValid) {
    return { isValid: false, response: createValidationErrorResponse(limitValidation.error!, limitValidation.code) };
  }

  return {
    isValid: true,
    values: {
      query: query ? sanitizeQuery(query) : null,
      page: pageValidation.value!,
      limit: limitValidation.value!,
    },
  };
}
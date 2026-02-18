// Simple in-memory rate limiter for edge functions
// Uses IP-based throttling with configurable limits

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (resets on cold start, but provides basic protection)
const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  maxRequests: number;    // Max requests per window
  windowMs: number;       // Time window in milliseconds
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 10,        // 10 requests per minute per IP
  windowMs: 60 * 1000,    // 1 minute
};

export function getClientIP(req: Request): string {
  // Try various headers for client IP
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  
  // Fallback - use a hash of user-agent + accept-language as fingerprint
  const userAgent = req.headers.get("user-agent") || "unknown";
  const acceptLang = req.headers.get("accept-language") || "unknown";
  return `fingerprint-${hashString(userAgent + acceptLang)}`;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function checkRateLimit(
  clientIP: string, 
  config: RateLimitConfig = DEFAULT_CONFIG
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const key = clientIP;
  
  // Clean up expired entries periodically
  if (Math.random() < 0.1) {
    cleanupExpiredEntries(now);
  }
  
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    // First request or window expired - create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }
  
  // Within window - check count
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }
  
  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}

function cleanupExpiredEntries(now: number): void {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

export function createRateLimitResponse(resetIn: number): Response {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Retry-After": Math.ceil(resetIn / 1000).toString(),
  };
  
  return new Response(
    JSON.stringify({ 
      error: "Too many requests. Please try again later.",
      retryAfter: Math.ceil(resetIn / 1000)
    }),
    { status: 429, headers }
  );
}

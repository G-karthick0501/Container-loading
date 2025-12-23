import rateLimit from 'express-rate-limit';

// ======================
// AUTH LIMITER
// ======================
// For login/signup - strict because these are attack targets
// 5 attempts per minute = human can retry typos, but scripts get blocked
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    error: 'Too many attempts. Please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ======================
// OPTIMIZE LIMITER (IP-based)
// ======================
// Catches: one device using multiple stolen accounts
// 10 per minute from same IP is generous for legitimate use
export const optimizeIpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    error: 'Too many optimization requests from this location.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false
  // No keyGenerator = uses default IP-based (handles IPv6 correctly)
});

// ======================
// OPTIMIZE LIMITER (User-based)  
// ======================
// Catches: one user attacking from multiple devices
// 5 per minute per user - they don't need more than this
export const optimizeUserLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    error: 'Too many optimization requests for this account.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Only use user ID - don't fall back to IP
    // If no user, this route shouldn't be accessible anyway (protect middleware)
    return req.user?.id || 'anonymous';
  }
});
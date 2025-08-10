import { Request, Response, NextFunction } from 'express';

export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com",
    "frame-src 'self' https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '));
  
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
};

export const generalRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // 100 requests per 15 minutes
  
  if (!(req as any).rateLimitStore) {
    (req as any).rateLimitStore = new Map();
  }
  
  const store = (req as any).rateLimitStore;
  const clientData = store.get(clientIp);
  
  if (!clientData || now > clientData.resetTime) {
    store.set(clientIp, { count: 1, resetTime: now + windowMs });
  } else if (clientData.count >= maxRequests) {
    return res.status(429).json({
      error: 'Too many requests',
      details: 'Please wait before making more requests',
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
    });
  } else {
    clientData.count++;
  }
  
  next();
}; 

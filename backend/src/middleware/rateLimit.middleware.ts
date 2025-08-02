import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';

export const rateLimitAI = (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.userId || req.ip;
  const rateLimitResult = aiService.checkRateLimit(userId);

  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      error: 'Too many AI summary requests',
      details: 'Please wait 15 minutes before requesting another AI summary',
      retryAfter: rateLimitResult.retryAfter
    });
  }

  next();
}; 
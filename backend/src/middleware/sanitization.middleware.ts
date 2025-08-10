import { Request, Response, NextFunction } from 'express';

// HTML tag removal
const removeHtmlTags = (str: string): string => {
  return str.replace(/<[^>]*>/g, '');
};

const sanitizeString = (value: any): string => {
  if (typeof value !== 'string') return '';
  return removeHtmlTags(value.trim());
};

const sanitizeStringArray = (value: any): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter(item => typeof item === 'string')
    .map(item => sanitizeString(item))
    .filter(item => item.length > 0);
};

const sanitizeObject = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = sanitizeStringArray(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {

  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  
  next();
}; 

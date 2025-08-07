import { Request, Response, NextFunction } from 'express';

// Type definitions for validation rules
interface ValidationRule {
  required?: boolean;
  type?: string;
  validate?: (value: any) => boolean;
  message?: string;
}

interface ValidationSchema {
  body?: Record<string, ValidationRule>;
  query?: Record<string, ValidationRule>;
  params?: Record<string, ValidationRule>;
}

// Human-readable validation functions
const validationRules = {
  email: (email: string): boolean => {
    if (!email || typeof email !== 'string') return false;
    
    const trimmedEmail = email.trim();
    if (trimmedEmail.length === 0 || trimmedEmail.length > 254) return false;
    
    // Check for exactly one @ symbol
    const atCount = (trimmedEmail.match(/@/g) || []).length;
    if (atCount !== 1) return false;
    
    // Split into local part and domain
    const [localPart, domain] = trimmedEmail.split('@');
    if (!localPart || !domain) return false;
    
    // RFC 5321: local part max 64 chars, domain max 253 chars
    if (localPart.length > 64 || domain.length > 253) return false;
    
    // Domain must have at least one dot and valid TLD (at least 2 chars)
    if (!domain.includes('.') || domain.split('.').pop()!.length < 2) return false;
    
    // Basic format check: no spaces, has @, has domain with dot
    const hasValidFormat = trimmedEmail.includes('@') && 
                          !trimmedEmail.includes(' ') && 
                          domain.includes('.');
    
    return hasValidFormat;
  },
  
  userId: (userId: string): boolean => {
    return typeof userId === 'string' && userId.length > 0 && userId.length <= 100;
  },
  
  organizationId: (orgId: string): boolean => {
    return typeof orgId === 'string' && orgId.length > 0 && orgId.length <= 100;
  },
  
  title: (title: string): boolean => {
    return typeof title === 'string' && title.trim().length >= 1 && title.length <= 200;
  },
  
  description: (description: string): boolean => {
    return typeof description === 'string' && description.trim().length >= 1 && description.length <= 5000;
  },
  
  name: (name: string): boolean => {
    return typeof name === 'string' && name.trim().length >= 1 && name.length <= 100;
  },
  
  cveId: (cveId: string): boolean => {
    if (!cveId || typeof cveId !== 'string') return false;
    
    // Must start with "CVE-" (case insensitive)
    if (!cveId.toUpperCase().startsWith('CVE-')) return false;
    
    // Split into parts: CVE, year, number
    const parts = cveId.split('-');
    if (parts.length !== 3) return false;
    
    const [, year, number] = parts;
    
    // Year must be 4 digits
    if (!/^\d{4}$/.test(year)) return false;
    
    // Number must be 4-5 digits
    if (!/^\d{4,5}$/.test(number)) return false;
    
    return true;
  },
  
  priority: (priority: string): boolean => {
    const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
    return validPriorities.includes(priority);
  },
  
  status: (status: string): boolean => {
    const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
    return validStatuses.includes(status);
  },
  
  role: (role: string): boolean => {
    const validRoles = ['admin', 'editor', 'viewer', 'unassigned'];
    return validRoles.includes(role);
  }
};

// Validation middleware factory
export const validateRequest = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];
    
    // Validate body
    if (schema.body) {
      for (const [field, rule] of Object.entries(schema.body)) {
        const value = req.body[field];
        
        if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
          errors.push(`${field} is required`);
          continue;
        }
        
        if (value && rule.type && typeof value !== rule.type) {
          errors.push(`${field} must be a ${rule.type}`);
          continue;
        }
        
        if (value && rule.validate && !rule.validate(value)) {
          errors.push(rule.message || `${field} is invalid`);
        }
      }
    }
    
    // Validate query parameters
    if (schema.query) {
      for (const [field, rule] of Object.entries(schema.query)) {
        const value = req.query[field];
        
        if (rule.required && !value) {
          errors.push(`${field} query parameter is required`);
          continue;
        }
        
        if (value && rule.validate && !rule.validate(value as string)) {
          errors.push(rule.message || `${field} query parameter is invalid`);
        }
      }
    }
    
    // Validate URL parameters
    if (schema.params) {
      for (const [field, rule] of Object.entries(schema.params)) {
        const value = req.params[field];
        
        if (rule.required && !value) {
          errors.push(`${field} parameter is required`);
          continue;
        }
        
        if (value && rule.validate && !rule.validate(value)) {
          errors.push(rule.message || `${field} parameter is invalid`);
        }
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }
    
    next();
  };
};

// Predefined validation schemas
export const validationSchemas = {
  createUser: {
    body: {
      email: { required: true, validate: validationRules.email, message: 'Valid email is required' },
      googleId: { required: true, validate: validationRules.userId, message: 'Valid Google ID is required' },
      firstName: { required: false, validate: validationRules.name, message: 'First name must be 1-100 characters' },
      lastName: { required: false, validate: validationRules.name, message: 'Last name must be 1-100 characters' }
    }
  },
  
  createIncident: {
    body: {
      title: { required: true, validate: validationRules.title, message: 'Title must be 1-200 characters' },
      description: { required: true, validate: validationRules.description, message: 'Description must be 1-5000 characters' },
      status: { required: true, validate: validationRules.status, message: 'Valid status is required' },
      priority: { required: true, validate: validationRules.priority, message: 'Valid priority is required' },
      reportedByUserId: { required: true, validate: validationRules.userId, message: 'Valid user ID is required' },
      organizationId: { required: true, validate: validationRules.organizationId, message: 'Valid organization ID is required' }
    }
  },
  
  updateUser: {
    params: {
      userId: { required: true, validate: validationRules.userId, message: 'Valid user ID is required' }
    }
  },
  
  updateIncident: {
    params: {
      incidentId: { required: true, validate: validationRules.userId, message: 'Valid incident ID is required' }
    }
  }
};

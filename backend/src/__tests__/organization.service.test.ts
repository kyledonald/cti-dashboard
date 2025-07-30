import { jest } from '@jest/globals';
import { OrganizationService } from '../services/organization.service';

describe('OrganizationService', () => {
  let organizationService: OrganizationService;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          get: jest.fn(),
          set: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        })),
        where: jest.fn(() => ({
          get: jest.fn(),
        })),
        orderBy: jest.fn(() => ({
          get: jest.fn(),
        })),
        add: jest.fn(),
        get: jest.fn(),
      })),
      batch: jest.fn(() => ({
        delete: jest.fn(),
        update: jest.fn(),
        commit: jest.fn(),
      })),
    };

    organizationService = new OrganizationService(mockDb);
  });

  describe('constructor', () => {
    it('should create OrganizationService instance', () => {
      expect(organizationService).toBeInstanceOf(OrganizationService);
    });

    it('should call collection with organizations', () => {
      expect(mockDb.collection).toHaveBeenCalledWith('organizations');
    });
  });

  describe('service methods', () => {
    it('should have getAllOrganizations method', () => {
      expect(typeof organizationService.getAllOrganizations).toBe('function');
    });

    it('should have getOrganizationById method', () => {
      expect(typeof organizationService.getOrganizationById).toBe('function');
    });

    it('should have createOrganization method', () => {
      expect(typeof organizationService.createOrganization).toBe('function');
    });

    it('should have updateOrganization method', () => {
      expect(typeof organizationService.updateOrganization).toBe('function');
    });

    it('should have deleteOrganization method', () => {
      expect(typeof organizationService.deleteOrganization).toBe('function');
    });
  });
}); 
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CasesService } from './cases.service';
import { Case, CaseType, CaseStatus, Jurisdiction } from '../../entities/case.entity';
import { CaseInvolvement } from '../../entities/case-involvement.entity';
import { NotFoundException } from '@nestjs/common';

describe('CasesService', () => {
  let service: CasesService;
  let casesRepository: Repository<Case>;
  let involvementsRepository: Repository<CaseInvolvement>;

  const mockCase: Case = {
    id: 'case-uuid',
    caseNumber: '1:20-cr-00177',
    title: 'Test Case',
    titleEs: 'Caso de Prueba',
    type: CaseType.INDICTMENT,
    jurisdiction: Jurisdiction.USA,
    court: 'Test Court',
    description: 'Test description',
    descriptionEs: 'Descripción de prueba',
    charges: ['Charge 1'],
    chargesEs: ['Cargo 1'],
    filingDate: new Date('2020-01-01'),
    resolutionDate: undefined,
    status: CaseStatus.OPEN,
    documentUrl: undefined,
    sourceUrl: 'https://test.gov',
    metadata: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    involvements: [],
  } as any;

  const mockInvolvement: CaseInvolvement = {
    id: 'involvement-uuid',
    officialId: 'official-uuid',
    caseId: 'case-uuid',
    role: 'defendant' as any,
    details: 'Test details',
    detailsEs: 'Detalles de prueba',
    createdAt: new Date(),
    official: undefined,
    case: undefined,
  } as any;

  const mockCasesRepository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockInvolvementsRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CasesService,
        {
          provide: getRepositoryToken(Case),
          useValue: mockCasesRepository,
        },
        {
          provide: getRepositoryToken(CaseInvolvement),
          useValue: mockInvolvementsRepository,
        },
      ],
    }).compile();

    service = module.get<CasesService>(CasesService);
    casesRepository = module.get<Repository<Case>>(getRepositoryToken(Case));
    involvementsRepository = module.get<Repository<CaseInvolvement>>(
      getRepositoryToken(CaseInvolvement),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated list of cases', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockCase], 1]),
      };

      mockCasesRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toEqual([mockCase]);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it('should filter by type', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockCase], 1]),
      };

      mockCasesRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findAll({ 
        type: CaseType.INDICTMENT,
        page: 1,
        limit: 20
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'case.type = :type',
        { type: CaseType.INDICTMENT }
      );
    });

    it('should filter by jurisdiction', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockCase], 1]),
      };

      mockCasesRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findAll({ 
        jurisdiction: Jurisdiction.USA,
        page: 1,
        limit: 20
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'case.jurisdiction = :jurisdiction',
        { jurisdiction: Jurisdiction.USA }
      );
    });
  });

  describe('findOne', () => {
    it('should return a case by id', async () => {
      mockCasesRepository.findOne.mockResolvedValue(mockCase);

      const result = await service.findOne('case-uuid');

      expect(result).toEqual(mockCase);
      expect(mockCasesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'case-uuid' },
        relations: ['involvements', 'involvements.official'],
      });
    });

    it('should throw NotFoundException when case not found', async () => {
      mockCasesRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByOfficial', () => {
    it('should return all cases for an official', async () => {
      mockInvolvementsRepository.find.mockResolvedValue([mockInvolvement]);

      const result = await service.findByOfficial('official-uuid');

      expect(result).toEqual([mockInvolvement]);
      expect(mockInvolvementsRepository.find).toHaveBeenCalledWith({
        where: { officialId: 'official-uuid' },
        relations: ['case'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('create', () => {
    it('should create a new case', async () => {
      const createDto = {
        caseNumber: '1:20-cr-00177',
        title: 'New Case',
        type: CaseType.CRIMINAL,
        jurisdiction: Jurisdiction.USA,
      };

      mockCasesRepository.create.mockReturnValue(mockCase);
      mockCasesRepository.save.mockResolvedValue(mockCase);

      const result = await service.create(createDto);

      expect(result).toEqual(mockCase);
      expect(mockCasesRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockCasesRepository.save).toHaveBeenCalledWith(mockCase);
    });
  });

  describe('addInvolvement', () => {
    it('should add an official to a case', async () => {
      const involvementData = {
        role: 'defendant' as any,
        details: 'Test details',
      };

      mockInvolvementsRepository.create.mockReturnValue(mockInvolvement);
      mockInvolvementsRepository.save.mockResolvedValue(mockInvolvement);

      const result = await service.addInvolvement(
        'case-uuid',
        'official-uuid',
        involvementData,
      );

      expect(result).toEqual(mockInvolvement);
      expect(mockInvolvementsRepository.create).toHaveBeenCalledWith({
        ...involvementData,
        caseId: 'case-uuid',
        officialId: 'official-uuid',
      });
    });
  });
});

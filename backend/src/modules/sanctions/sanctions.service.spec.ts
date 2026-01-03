import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SanctionsService } from './sanctions.service';
import { Sanction, SanctionType, SanctionStatus } from '../../entities/sanction.entity';
import { NotFoundException } from '@nestjs/common';

describe('SanctionsService', () => {
  let service: SanctionsService;
  let repository: Repository<Sanction>;

  const mockSanction: Sanction = {
    id: 'sanction-uuid',
    officialId: 'official-uuid',
    type: SanctionType.OFAC_SDN,
    programCode: 'VENEZUELA',
    programName: 'Venezuela Sanctions Program',
    ofacId: '12345',
    reason: 'Corruption',
    reasonEs: 'Corrupción',
    imposedDate: new Date('2018-05-21'),
    liftedDate: undefined,
    status: SanctionStatus.ACTIVE,
    treasuryPressRelease: undefined,
    sourceUrl: 'https://ofac.treasury.gov',
    metadata: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    official: undefined,
  } as any;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getRawMany: jest.fn(),
  };

  const mockRepository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SanctionsService,
        {
          provide: getRepositoryToken(Sanction),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SanctionsService>(SanctionsService);
    repository = module.get<Repository<Sanction>>(getRepositoryToken(Sanction));

    // Setup default mockQueryBuilder return values
    mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockSanction], 1]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated list of sanctions', async () => {
      const sanctions = [mockSanction];
      mockRepository.findAndCount.mockResolvedValue([sanctions, 1]);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toEqual(sanctions);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it('should filter by type', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockSanction], 1]);

      const result = await service.findAll({ 
        type: SanctionType.OFAC_SDN,
        page: 1,
        limit: 20
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'sanction.type = :type',
        { type: SanctionType.OFAC_SDN }
      );
    });

    it('should filter by status', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockSanction], 1]);

      await service.findAll({ 
        status: SanctionStatus.ACTIVE,
        page: 1,
        limit: 20
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'sanction.status = :status',
        { status: SanctionStatus.ACTIVE }
      );
    });
  });

  describe('findOne', () => {
    it('should return a sanction by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockSanction);

      const result = await service.findOne('sanction-uuid');

      expect(result).toEqual(mockSanction);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'sanction-uuid' },
        relations: ['official'],
      });
    });

    it('should throw NotFoundException when sanction not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new sanction', async () => {
      const createDto = {
        officialId: 'official-uuid',
        type: SanctionType.OFAC_SDN,
        programName: 'Test Program',
        reason: 'Test reason',
        imposedDate: new Date('2020-01-01'),
      } as any;

      mockRepository.create.mockReturnValue(mockSanction);
      mockRepository.save.mockResolvedValue(mockSanction);

      const result = await service.create(createDto);

      expect(result).toEqual(mockSanction);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockSanction);
    });
  });

  describe('getStatistics', () => {
    it('should return statistics about sanctions', async () => {
      const mockByType = [
        { type: 'ofac_sdn', count: '10' },
        { type: 'eu', count: '5' },
      ];
      const mockByYear = [
        { year: '2018', count: '12' },
        { year: '2019', count: '3' },
      ];

      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce(mockByType)
        .mockResolvedValueOnce(mockByYear);

      mockRepository.count.mockResolvedValue(15);

      const result = await service.getStatistics();

      expect(result.total).toBe(15);
      expect(result.byType).toHaveLength(2);
      expect(result.byType[0]).toHaveProperty('type');
      expect(result.byType[0]).toHaveProperty('count');
      expect(result.byYear).toHaveLength(2);
      expect(result.byYear[0]).toHaveProperty('year');
      expect(result.byYear[0]).toHaveProperty('count');
    });
  });
});

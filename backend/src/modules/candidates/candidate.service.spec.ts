import { Test, TestingModule } from '@nestjs/testing';
import { CandidateService } from './candidate.service';
import { Candidate, CandidateStatus } from './candidate.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JobService } from '../jobs/job.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('CandidateService', () => {
  let service: CandidateService;
  let repository: Repository<Candidate>;
  let jobService: JobService;

  const mockCandidate: Candidate = {
    id: 'test-id',
    name: 'Test Candidate',
    email: 'test@example.com',
    status: CandidateStatus.APPLIED,
    jobId: 'job-id',
    organizationId: 'org-id',
    sequenceId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    job: null,
    interviews: [],
  };

  let mockQueryBuilder: any;
  let mockRepository: any;
  let mockJobService: any;

  beforeEach(async () => {
    // Resetar mocks antes de cada teste
    mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(mockCandidate),
      getMany: jest.fn().mockResolvedValue([mockCandidate]),
    };

    mockRepository = {
      create: jest.fn().mockReturnValue(mockCandidate),
      save: jest.fn().mockResolvedValue(mockCandidate),
      findOne: jest.fn().mockResolvedValue(null), // null por padrão para evitar conflitos
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    mockJobService = {
      findById: jest.fn().mockResolvedValue({
        id: 'job-id',
        organizationId: 'org-id',
        title: 'Test Job',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandidateService,
        {
          provide: getRepositoryToken(Candidate),
          useValue: mockRepository,
        },
        {
          provide: JobService,
          useValue: mockJobService,
        },
      ],
    }).compile();

    // Desabilitar logs durante testes
    module.useLogger(false);

    service = module.get<CandidateService>(CandidateService);
    repository = module.get<Repository<Candidate>>(
      getRepositoryToken(Candidate),
    );
    jobService = module.get<JobService>(JobService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should call createQueryBuilder with correct parameters and return candidate', async () => {
      const result = await service.findById('test-id');

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith(
        'candidate',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'candidate.interviews',
        'interview',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'candidate.id = :id',
        { id: 'test-id' },
      );
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
      expect(result).toEqual(mockCandidate);
    });

    it('should throw NotFoundException when candidate not found', async () => {
      // Mock retornando null para AMBAS as chamadas
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(service.findById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a candidate with organizationId from job', async () => {
      // findOne deve retornar null (sem duplicatas)
      mockRepository.findOne.mockResolvedValueOnce(null);

      const createDto = {
        name: 'Test Candidate',
        email: 'test@example.com',
        status: CandidateStatus.APPLIED,
        jobId: 'job-id',
      };

      const result = await service.create(createDto);

      expect(mockJobService.findById).toHaveBeenCalledWith('job-id');
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: createDto.email, jobId: createDto.jobId },
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        organizationId: 'org-id',
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockCandidate);
    });

    it('should throw ConflictException when candidate already exists', async () => {
      // Mock retornando candidato existente
      mockRepository.findOne.mockResolvedValue(mockCandidate);

      const createDto = {
        name: 'Test Candidate',
        email: 'test@example.com',
        status: CandidateStatus.APPLIED,
        jobId: 'job-id',
      };

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated candidates', async () => {
      const filter = { limit: 10 };
      const organizationId = 'org-id';

      const result = await service.findAll(filter, organizationId);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith(
        'candidate',
      );
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('nextCursor');
      expect(result).toHaveProperty('hasMore');
    });
  });

  describe('update', () => {
    it('should update candidate', async () => {
      // Mock findOne retornando candidato existente
      mockRepository.findOne.mockResolvedValueOnce(mockCandidate);

      const updateDto = { name: 'Updated Name' };

      const result = await service.update('test-id', updateDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(mockRepository.update).toHaveBeenCalled();
      expect(result).toEqual(mockCandidate);
    });

    it('should throw NotFoundException when candidate not found', async () => {
      // Mock findOne retornando null
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete candidate', async () => {
      // Mock findOne retornando candidato existente
      mockRepository.findOne.mockResolvedValueOnce(mockCandidate);

      const result = await service.remove('test-id');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(mockRepository.delete).toHaveBeenCalledWith('test-id');
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw NotFoundException when candidate not found', async () => {
      // Mock findOne retornando null
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
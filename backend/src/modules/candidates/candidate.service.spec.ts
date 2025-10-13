import { CandidateService } from './candidate.service';
import { Candidate } from './candidate.entity';
import { Repository } from 'typeorm';

describe('CandidateService', () => {
  let service: CandidateService;
  let repo: Repository<Candidate>;

  beforeEach(() => {
    repo = {} as any;
    service = new CandidateService(repo, {} as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Exemplo: testar método findById
  it('should call findOne with correct id', async () => {
    const findOneMock = jest.fn().mockResolvedValue({ id: 'test-id' });
    (repo.findOne as any) = findOneMock;
    const result = await service.findById('test-id');
    expect(findOneMock).toHaveBeenCalledWith({ where: { id: 'test-id' } });
    expect(result).toEqual({ id: 'test-id' });
  });
});

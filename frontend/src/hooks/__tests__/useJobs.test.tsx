import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useJobsInfinite } from '../useJobs';
import { api } from '@/lib/api/axios';

// Mock do axios
jest.mock('@/lib/api/axios');

// Mock do useAuth
jest.mock('../useAuth', () => ({
  useAuth: () => ({
    user: {
      sub: 'user-id',
      email: 'test@test.com',
      role: 'admin',
      organizationId: 'org-123'
    }
  })
}));

describe('useJobsInfinite', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('deve buscar vagas com sucesso', async () => {
    const mockData = {
      data: [
        {
          id: '1',
          title: 'Desenvolvedor Frontend',
          status: 'open' as const,
          organizationId: 'org-123',
          createdAt: '2025-01-01'
        }
      ],
      hasMore: false
    };

    (api.get as jest.Mock).mockResolvedValue({ data: mockData });

    const { result } = renderHook(
      () => useJobsInfinite({ status: '', limit: 10 }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.pages[0].data).toHaveLength(1);
    expect(result.current.data?.pages[0].data[0].title).toBe('Desenvolvedor Frontend');
    expect(api.get).toHaveBeenCalledWith('/jobs', {
      params: { limit: 10 }
    });
  });

  it('deve buscar apenas vagas abertas quando filtro status for "open"', async () => {
    const mockData = {
      data: [
        {
          id: '1',
          title: 'Vaga Aberta',
          status: 'open' as const,
          organizationId: 'org-123',
          createdAt: '2025-01-01'
        }
      ],
      hasMore: false
    };

    (api.get as jest.Mock).mockResolvedValue({ data: mockData });

    const { result } = renderHook(
      () => useJobsInfinite({ status: 'open', limit: 10 }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.get).toHaveBeenCalledWith('/jobs', {
      params: { status: 'open', limit: 10 }
    });
  });

  it('deve lidar com erro de rede', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(
      () => useJobsInfinite({ status: '', limit: 10 }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });

  it('deve buscar próxima página com cursor', async () => {
    const mockFirstPage = {
      data: [{ id: '1', title: 'Vaga 1', status: 'open' as const, organizationId: 'org-123', createdAt: '2025-01-01' }],
      nextCursor: 'cursor-123',
      hasMore: true
    };

    const mockSecondPage = {
      data: [{ id: '2', title: 'Vaga 2', status: 'open' as const, organizationId: 'org-123', createdAt: '2025-01-02' }],
      hasMore: false
    };

    (api.get as jest.Mock)
      .mockResolvedValueOnce({ data: mockFirstPage })
      .mockResolvedValueOnce({ data: mockSecondPage });

    const { result } = renderHook(
      () => useJobsInfinite({ status: '', limit: 10 }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Buscar próxima página
    result.current.fetchNextPage();

    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));

    expect(api.get).toHaveBeenNthCalledWith(2, '/jobs', {
      params: { limit: 10, cursor: 'cursor-123' }
    });
  });
});
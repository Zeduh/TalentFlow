import { render, screen } from '@testing-library/react';
import { JobCard } from '../JobCard';
import '@testing-library/jest-dom';

describe('JobCard', () => {
  const mockJob = {
    id: '1',
    title: 'Desenvolvedor Frontend',
    status: 'open' as const,
    organizationId: 'org-123',
    createdAt: '2025-01-15T10:00:00Z'
  };

  it('deve renderizar informações da vaga corretamente', () => {
    render(<JobCard job={mockJob} />);

    expect(screen.getByText('Desenvolvedor Frontend')).toBeInTheDocument();
    expect(screen.getByText('Aberta')).toBeInTheDocument();
    expect(screen.getByText('Ver detalhes')).toBeInTheDocument();
  });

  it('deve exibir status "Aberta" com estilo verde para vagas abertas', () => {
    render(<JobCard job={mockJob} />);

    const statusBadge = screen.getByText('Aberta');
    expect(statusBadge).toHaveClass('bg-green-100', 'text-green-900', 'border-green-200');
  });

  it('deve exibir status "Fechada" com estilo vermelho para vagas fechadas', () => {
    const closedJob = { ...mockJob, status: 'closed' as const };
    render(<JobCard job={closedJob} />);

    const statusBadge = screen.getByText('Fechada');
    expect(statusBadge).toHaveClass('bg-red-100', 'text-red-900', 'border-red-200');
  });

  it('deve exibir status "Pausada" com estilo amarelo para vagas pausadas', () => {
    const pausedJob = { ...mockJob, status: 'paused' as const };
    render(<JobCard job={pausedJob} />);

    const statusBadge = screen.getByText('Pausada');
    expect(statusBadge).toHaveClass('bg-yellow-100', 'text-yellow-900', 'border-yellow-200');
  });

  it('deve formatar data de criação corretamente', () => {
    render(<JobCard job={mockJob} />);

    // A data deve estar formatada como dd/mm/yyyy
    expect(screen.getByText('15/01/2025')).toBeInTheDocument();
  });

  it('deve ter link correto para detalhe da vaga', () => {
    render(<JobCard job={mockJob} />);

    const link = screen.getByRole('link', { name: /ver detalhes/i });
    expect(link).toHaveAttribute('href', '/jobs/1');
  });

  it('deve aplicar classes de estilo corretas', () => {
    const { container } = render(<JobCard job={mockJob} />);

    const card = container.querySelector('.bg-white.rounded-lg.border');
    expect(card).toBeInTheDocument();
  });

  it('deve lidar com status desconhecido graciosamente', () => {
    const unknownStatusJob = { ...mockJob, status: 'unknown' as any };
    render(<JobCard job={unknownStatusJob} />);

    const statusBadge = screen.getByText('unknown');
    expect(statusBadge).toHaveClass('bg-gray-100', 'text-gray-900', 'border-gray-200');
  });
});
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Home from '../page';

describe('Home page', () => {
  it('deve renderizar mensagem de boas-vindas', () => {
    render(<Home />);
    expect(screen.getByText(/Welcome to TalentFlow!/i)).toBeInTheDocument();
  });
});
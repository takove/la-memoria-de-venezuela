import { render, screen, fireEvent } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { goto } from '$app/navigation';
import HomePage from '../+page.svelte';

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows hero content and CTA links', () => {
    render(HomePage);

    expect(screen.getByRole('heading', { name: /La Memoria de Venezuela/i })).toBeInTheDocument();
    expect(screen.getByText(/Busca por nombre, cargo, o tipo de sanción/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /explorar base de datos/i })).toHaveAttribute('href', '/officials');
    expect(screen.getByRole('link', { name: /Conocer más/i })).toHaveAttribute('href', '/about');
  });

  it('navigates to search results when submitting query', async () => {
    render(HomePage);

    const input = screen.getByPlaceholderText('Buscar funcionarios, sanciones, casos...');

    await fireEvent.input(input, { target: { value: 'maduro' } });
    await fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(goto).toHaveBeenCalledWith('/search?q=maduro');
  });
});

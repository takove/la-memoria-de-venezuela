import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import OfficialCard from '../OfficialCard.svelte';

describe('OfficialCard', () => {
  const mockOfficialMinimal = {
    id: 'official-123',
    fullName: 'Nicolás Maduro',
    status: 'active',
  };

  const mockOfficialComplete = {
    id: 'official-456',
    fullName: 'Diosdado Cabello',
    photoUrl: 'https://example.com/photo.jpg',
    status: 'active',
    sanctions: [
      { id: 'sanction-1', type: 'OFAC' },
      { id: 'sanction-2', type: 'EU' },
    ],
    positions: [
      { id: 'pos-1', title: 'Minister of Interior' },
      { id: 'pos-2', title: 'Vice President' },
    ],
  };

  it('renders official name', () => {
    render(OfficialCard, { props: { official: mockOfficialMinimal } });
    expect(screen.getByText('Nicolás Maduro')).toBeInTheDocument();
  });

  it('renders as a link to official detail page', () => {
    render(OfficialCard, { props: { official: mockOfficialMinimal } });
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/officials/official-123');
  });

  it('displays photo when photoUrl is provided', () => {
    render(OfficialCard, { props: { official: mockOfficialComplete } });
    const img = screen.getByAltText('Diosdado Cabello');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('displays placeholder emoji when no photo', () => {
    const { container } = render(OfficialCard, { props: { official: mockOfficialMinimal } });
    // Check for emoji placeholder
    expect(container.textContent).toContain('👤');
  });

  it('displays status badge with correct color', () => {
    render(OfficialCard, { props: { official: mockOfficialMinimal } });
    const badge = screen.getByText('active');
    expect(badge).toHaveClass('badge-danger');
  });

  it('displays status badge for exiled official', () => {
    const exiledOfficial = { ...mockOfficialMinimal, status: 'exiled' };
    render(OfficialCard, { props: { official: exiledOfficial } });
    const badge = screen.getByText('exiled');
    expect(badge).toHaveClass('badge-warning');
  });

  it('displays status badge for imprisoned official', () => {
    const imprisonedOfficial = { ...mockOfficialMinimal, status: 'imprisoned' };
    render(OfficialCard, { props: { official: imprisonedOfficial } });
    const badge = screen.getByText('imprisoned');
    expect(badge).toHaveClass('badge-success');
  });

  it('displays status badge for deceased official', () => {
    const deceasedOfficial = { ...mockOfficialMinimal, status: 'deceased' };
    render(OfficialCard, { props: { official: deceasedOfficial } });
    const badge = screen.getByText('deceased');
    expect(badge).toHaveClass('badge');
    expect(badge).toHaveClass('bg-gray-100');
  });

  it('displays first position title when positions exist', () => {
    render(OfficialCard, { props: { official: mockOfficialComplete } });
    expect(screen.getByText('Minister of Interior')).toBeInTheDocument();
  });

  it('does not display position when positions array is empty', () => {
    const officialNoPosition = {
      ...mockOfficialMinimal,
      positions: [],
    };
    render(OfficialCard, { props: { official: officialNoPosition } });
    expect(screen.queryByText(/minister/i)).not.toBeInTheDocument();
  });

  it('displays sanctions count badge', () => {
    render(OfficialCard, { props: { official: mockOfficialComplete } });
    expect(screen.getByText(/2 sanción\(es\)/i)).toBeInTheDocument();
  });

  it('does not display sanctions badge when no sanctions', () => {
    render(OfficialCard, { props: { official: mockOfficialMinimal } });
    expect(screen.queryByText(/sanción/i)).not.toBeInTheDocument();
  });

  it('displays "Ver perfil completo" call-to-action', () => {
    render(OfficialCard, { props: { official: mockOfficialMinimal } });
    expect(screen.getByText(/ver perfil completo/i)).toBeInTheDocument();
  });

  it('applies hover state classes for interactivity', () => {
    const { container } = render(OfficialCard, { props: { official: mockOfficialMinimal } });
    const card = container.querySelector('.card');
    expect(card).toHaveClass('hover:shadow-lg');
    expect(card).toHaveClass('transition-all');
  });

  it('renders with proper card structure', () => {
    const { container } = render(OfficialCard, { props: { official: mockOfficialMinimal } });
    const card = container.querySelector('.card');
    expect(card).toBeInTheDocument();
  });

  it('has accessible image alt text', () => {
    render(OfficialCard, { props: { official: mockOfficialComplete } });
    const img = screen.getByAltText('Diosdado Cabello');
    expect(img).toBeInTheDocument();
  });

  it('renders responsive photo sizes', () => {
    const { container } = render(OfficialCard, { props: { official: mockOfficialComplete } });
    const photoContainer = container.querySelector('.w-12.h-12.sm\\:w-16.sm\\:h-16');
    expect(photoContainer).toBeInTheDocument();
  });

  it('truncates long names for UI consistency', () => {
    const { container } = render(OfficialCard, { props: { official: mockOfficialComplete } });
    const nameElement = screen.getByText('Diosdado Cabello');
    expect(nameElement).toHaveClass('truncate');
  });

  it('renders bottom action bar with hover effect', () => {
    const { container } = render(OfficialCard, { props: { official: mockOfficialMinimal } });
    const bottomBar = container.querySelector('.group-hover\\:bg-primary-50');
    expect(bottomBar).toBeInTheDocument();
  });

  it('handles officials with undefined sanctions gracefully', () => {
    const officialNoSanctions = {
      ...mockOfficialMinimal,
      sanctions: undefined,
    };
    const { container } = render(OfficialCard, { props: { official: officialNoSanctions } });
    expect(container).toBeInTheDocument();
  });

  it('handles officials with undefined positions gracefully', () => {
    const officialNoPositions = {
      ...mockOfficialMinimal,
      positions: undefined,
    };
    const { container } = render(OfficialCard, { props: { official: officialNoPositions } });
    expect(container).toBeInTheDocument();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SavedToast from '../../components/SavedToast';

describe('Saved Toast tests', () => {
  it('returns null when show=false', () => {
    const { container } = render(<SavedToast show={false} />);
    expect(screen.queryByText(/saved/i)).toBeNull();
    expect(container).toBeEmptyDOMElement();
  });

  it('renders via portal when show=true', () => {
    render(<SavedToast show={true} />);
    expect(screen.getByText(/saved/i)).toBeInTheDocument();
  });
});

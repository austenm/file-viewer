import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { useState } from 'react';

describe('Error boundary test', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    (console.error as any).mockRestore?.();
  });

  it('renders custom fallback on error', () => {
    const Thrower = () => {
      throw new Error('boom');
    };

    render(
      <ErrorBoundary resetKey="k1" fallback={<div data-testid="fb">oops</div>}>
        <Thrower />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('fb')).toHaveTextContent('oops');
  });

  it('resets when resetKey changes and child stops throwing', () => {
    const Thrower = ({ boom }: { boom: boolean }) => {
      if (boom) throw new Error('boom');
      return <div>ok</div>;
    };

    const Wrap = () => {
      const [key, setKey] = useState('a');
      const [boom, setBoom] = useState(true);
      return (
        <>
          <button
            onClick={() => {
              setBoom(false);
              setKey('b');
            }}
          >
            flip
          </button>
          <ErrorBoundary
            resetKey={key}
            fallback={<div data-testid="fb">oops</div>}
          >
            <Thrower boom={boom} />
          </ErrorBoundary>
        </>
      );
    };

    render(<Wrap />);

    expect(screen.getByTestId('fb')).toBeInTheDocument();

    fireEvent.click(screen.getByText('flip'));
    expect(screen.getByText('ok')).toBeInTheDocument();
  });

  it('renders custom fallback and resets when resetKey changes', () => {
    const Thrower = ({ boom }: { boom: boolean }) => {
      if (boom) throw new Error('boom');
      return <div>ok</div>;
    };

    const Wrap = () => {
      const [boom, setBoom] = useState(true);
      const [k, setK] = useState('a');
      return (
        <>
          <button
            onClick={() => {
              setBoom(false);
              setK('b');
            }}
          >
            flip
          </button>
          <ErrorBoundary
            fallback={<div data-testid="fb">oops</div>}
            resetKey={k}
          >
            <Thrower boom={boom} />
          </ErrorBoundary>
        </>
      );
    };

    render(<Wrap />);
    expect(screen.getByTestId('fb')).toBeInTheDocument();
    fireEvent.click(screen.getByText('flip'));
    expect(screen.getByText('ok')).toBeInTheDocument();
  });
});

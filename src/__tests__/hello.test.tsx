import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';

function HelloButton() {
  return <button onClick={() => alert('clicked')}>Hello</button>;
}

describe('hello test', () => {
  it('renders and can be clicked', async () => {
    const u = user.setup();
    render(<HelloButton />);

    const btn = screen.getByRole('button', { name: /hello/i });
    expect(btn).toBeInTheDocument();

    await u.click(btn);
    expect(btn).toHaveTextContent(/hello/i);
  });
});

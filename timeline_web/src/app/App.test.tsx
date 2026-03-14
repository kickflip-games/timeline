import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App smoke flow', () => {
  it('plays one resolve and auto-advances to next round', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('button', { name: /play/i }));
    expect(await screen.findByRole('heading', { name: /current card/i })).toBeInTheDocument();

    await user.keyboard('{Enter}');

    expect(await screen.findByText(/advancing/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText(/advancing/i)).not.toBeInTheDocument();
    });
  });

  it('arrow keys move selected position', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('button', { name: /play/i }));
    expect(await screen.findByRole('heading', { name: /current card/i })).toBeInTheDocument();

    expect(screen.getByLabelText(/select insertion position 1/i)).toHaveAttribute('aria-current', 'true');

    await user.keyboard('{ArrowRight}');

    expect(screen.getByLabelText(/select insertion position 2/i)).toHaveAttribute('aria-current', 'true');
  });
});

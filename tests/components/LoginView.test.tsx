import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import { LoginView } from '../../src/components/LoginView';

describe('LoginView', () => {
  const mockOnSwitchToSignup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders login form with email and password inputs', () => {
    render(<LoginView onSwitchToSignup={mockOnSwitchToSignup} />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('displays error alert with error message', () => {
    render(<LoginView onSwitchToSignup={mockOnSwitchToSignup} />);
    
    const alertElement = screen.getByRole('alert');
    expect(alertElement).toBeInTheDocument();
  });

  it('provides link to switch to signup view', () => {
    render(<LoginView onSwitchToSignup={mockOnSwitchToSignup} />);
    
    const signupButton = screen.getByText(/don't have an account/i);
    expect(signupButton).toBeInTheDocument();
    fireEvent.click(signupButton);
    expect(mockOnSwitchToSignup).toHaveBeenCalled();
  });

  it('disables submit button while loading', async () => {
    global.fetch = vi.fn(() =>
      new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              ok: true,
              json: () =>
                Promise.resolve({
                  user: { id: '1', email: 'test@example.com', name: 'Test User', createdAt: new Date().toISOString() },
                  token: 'jwt-token',
                }),
            } as Response),
          100
        )
      )
    ) as any;

    render(<LoginView onSwitchToSignup={mockOnSwitchToSignup} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });
});

import { describe, it, expect } from 'vitest';
import { render } from '../test-utils';
import { axe } from 'jest-axe';
import { LoginView } from '@/components/LoginView';

describe('LoginView - Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    const { container } = render(
      <LoginView onSwitchToSignup={() => {}} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have properly associated form labels', () => {
    const { getByLabelText } = render(
      <LoginView onSwitchToSignup={() => {}} />
    );
    
    const emailInput = getByLabelText('Email');
    expect(emailInput).toBeInTheDocument();
    
    const passwordInput = getByLabelText('Password');
    expect(passwordInput).toBeInTheDocument();
  });

  it('should have autocomplete attributes on form inputs', () => {
    const { container } = render(
      <LoginView onSwitchToSignup={() => {}} />
    );
    
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    expect(emailInput?.getAttribute('autocomplete')).toBe('email');
    
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    expect(passwordInput?.getAttribute('autocomplete')).toBe('current-password');
  });

  it('should have accessible submit button', () => {
    const { getByRole } = render(
      <LoginView onSwitchToSignup={() => {}} />
    );
    
    const submitButton = getByRole('button', { name: /log in/i });
    expect(submitButton).toBeInTheDocument();
  });
});

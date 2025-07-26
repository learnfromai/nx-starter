import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { LoginForm } from './LoginForm';

// Mock the view model
const mockViewModel = {
  handleFormSubmit: vi.fn(),
  isSubmitting: false,
  error: null,
  clearError: vi.fn(),
  validateEmail: vi.fn(),
  getFieldError: vi.fn(),
};

vi.mock('../view-models/useLoginFormViewModel', () => ({
  useLoginFormViewModel: () => mockViewModel,
}));

// Helper function to render with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockViewModel.handleFormSubmit.mockResolvedValue(true);
    mockViewModel.isSubmitting = false;
    mockViewModel.error = null;
    mockViewModel.validateEmail.mockReturnValue(true);
    mockViewModel.getFieldError.mockReturnValue(null);
  });

  it('should render login form with all fields', () => {
    renderWithRouter(<LoginForm />);

    expect(screen.getByTestId('login-identifier-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('should show error message when there is an error', () => {
    mockViewModel.error = 'Invalid credentials';

    renderWithRouter(<LoginForm />);

    expect(screen.getByTestId('login-error')).toBeInTheDocument();
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('should disable submit button when submitting', () => {
    mockViewModel.isSubmitting = true;

    renderWithRouter(<LoginForm />);

    const submitButton = screen.getByTestId('login-submit-button');
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Logging in...')).toBeInTheDocument();
  });

  it('should show loading spinner when submitting', () => {
    mockViewModel.isSubmitting = true;

    renderWithRouter(<LoginForm />);

    // Should show loading spinner (animate-spin class)
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should call handleFormSubmit when form is submitted with valid data', async () => {
    const user = userEvent.setup();

    renderWithRouter(<LoginForm />);

    const identifierInput = screen.getByTestId('login-identifier-input');
    const passwordInput = screen.getByTestId('login-password-input');
    const submitButton = screen.getByTestId('login-submit-button');

    await user.type(identifierInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    // Ensure form is ready
    await waitFor(() => {
      expect(identifierInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
    });
    
    await user.click(submitButton);

    // Give some time for the form submission
    await waitFor(() => {
      expect(mockViewModel.handleFormSubmit).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should clear error when user starts typing', async () => {
    const user = userEvent.setup();
    mockViewModel.error = 'Invalid credentials';

    renderWithRouter(<LoginForm />);

    const identifierInput = screen.getByTestId('login-identifier-input');
    
    // Type a character to trigger the onChange event
    await user.type(identifierInput, 'a');

    // Wait for the clearError to be called
    await waitFor(() => {
      expect(mockViewModel.clearError).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('should show forgot password and create account links', () => {
    renderWithRouter(<LoginForm />);

    expect(screen.getByTestId('forgot-password-link')).toBeInTheDocument();
    expect(screen.getByTestId('create-account-link')).toBeInTheDocument();
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    renderWithRouter(<LoginForm />);

    const identifierInput = screen.getByTestId('login-identifier-input');
    const passwordInput = screen.getByTestId('login-password-input');

    expect(identifierInput).toHaveAttribute('placeholder', 'Username or Email');
    expect(passwordInput).toHaveAttribute('placeholder', 'Password');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
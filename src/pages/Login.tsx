import React, { useMemo, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import type { User } from '../api/auth.api';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

const REMEMBERED_EMAIL_KEY = 'aiclub:remembered-email';

type LoginErrors = {
  email?: string;
  password?: string;
};

type LoginLocationState = {
  message?: string;
  from?: {
    pathname?: string;
  };
};

const isValidEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, isAuthenticated, isLoading: isSessionLoading } = useAuth();
  const rememberedEmail = useMemo(
    () => localStorage.getItem(REMEMBERED_EMAIL_KEY) || '',
    [],
  );
  const [email, setEmail] = useState(rememberedEmail);
  const [password, setPassword] = useState('');
  const [rememberEmail, setRememberEmail] = useState(Boolean(rememberedEmail));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({});

  const getDestination = (signedInUser: User) => {
    const requestedPath = (location.state as LoginLocationState | null)?.from?.pathname;
    const role = signedInUser.role?.toLowerCase();

    if (role === 'admin' || role === 'super_admin') return '/admin';
    if (requestedPath?.startsWith('/') && !requestedPath.startsWith('/login')) {
      return requestedPath;
    }
    return '/dashboard';
  };

  const validate = () => {
    const nextErrors: LoginErrors = {};
    const normalizedEmail = email.trim();

    if (!normalizedEmail) nextErrors.email = 'Enter your email address.';
    else if (!isValidEmail(normalizedEmail)) nextErrors.email = 'Enter a valid email address.';
    if (!password) nextErrors.password = 'Enter your password.';

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const completeLogin = async (loginEmail: string, loginPassword: string) => {
    const signedInUser = await login(loginEmail, loginPassword);

    if (rememberEmail) localStorage.setItem(REMEMBERED_EMAIL_KEY, loginEmail);
    else localStorage.removeItem(REMEMBERED_EMAIL_KEY);

    navigate(getDestination(signedInUser), { replace: true });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await completeLogin(email.trim().toLowerCase(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not sign you in. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    const demoEmail = 'student@aiclub.com';
    setEmail(demoEmail);
    setPassword('student123');
    setFieldErrors({});
    setError('');
    setIsSubmitting(true);

    try {
      await completeLogin(demoEmail, 'student123');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo access is temporarily unavailable.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isSessionLoading && isAuthenticated && user) {
    return <Navigate to={getDestination(user)} replace />;
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your AI CLUB account."
    >
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        {(location.state as LoginLocationState | null)?.message && (
          <p className="login-notice" role="status">{(location.state as LoginLocationState).message}</p>
        )}
        <Input
          id="login-email"
          label="Email address"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (fieldErrors.email) setFieldErrors((current) => ({ ...current, email: undefined }));
          }}
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          error={fieldErrors.email}
          disabled={isSubmitting}
          required
        />

        <Input
          id="login-password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            if (fieldErrors.password) setFieldErrors((current) => ({ ...current, password: undefined }));
          }}
          autoComplete="current-password"
          error={fieldErrors.password}
          disabled={isSubmitting}
          required
        />

        <div className="login-options">
          <label className="checkbox-container" htmlFor="remember-email">
            <input
              id="remember-email"
              type="checkbox"
              checked={rememberEmail}
              onChange={(event) => setRememberEmail(event.target.checked)}
              disabled={isSubmitting}
            />
            <span>Remember my email</span>
          </label>
          <Link to="/forgot-password" className="login-help-link">
            Forgot password?
          </Link>
        </div>

        {error && (
          <div className="login-alert" role="alert" aria-live="assertive">
            <span className="login-alert-mark" aria-hidden="true">!</span>
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          isLoading={isSubmitting}
          loadingLabel="Checking credentials…"
          className="login-submit"
        >
          <span>Sign in</span>
          <ArrowRight size={17} />
        </Button>

        {import.meta.env.DEV && <>
        <div className="auth-divider" aria-hidden="true">
          <span>or</span>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="demo-btn"
          onClick={handleDemoLogin}
          disabled={isSubmitting}
          id="demo-login-btn"
        >
          <Sparkles size={16} />
          <span>Try the demo account</span>
        </Button>

        <p className="login-demo-note">No account needed — explore the student dashboard with sample data.</p>
        </>}

        <div className="login-footer-actions">
          <span>New to the club? <Link to="/register">Create an account</Link></span>
          <Link to="/admin/login" className="login-admin-link">Admin access <ArrowRight size={13} /></Link>
        </div>
      </form>
    </AuthLayout>
  );
};

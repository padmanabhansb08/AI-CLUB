import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await login('student@aiclub.com', 'student123');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Unable to connect to AI CLUB server for demo login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoFill = () => {
    setEmail('student@aiclub.com');
    setPassword('student123');
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your student account"
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="College Email"
          type="email"
          placeholder="student@aiclub.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex-between mb-6">
          <label className="checkbox-container">
            <input type="checkbox" />
            <span>Remember me</span>
          </label>
          <a href="#" className="text-sm text-accent" onClick={(e) => e.preventDefault()}>
            Forgot password?
          </a>
        </div>

        {error && <div className="form-error mb-4">{error}</div>}

        <Button type="submit" isLoading={isLoading} className="mb-4">
          Login
        </Button>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="demo-btn mb-3"
          onClick={handleDemoLogin}
          disabled={isLoading}
          id="demo-login-btn"
        >
          <Sparkles size={16} style={{ color: 'var(--accent-color)' }} />
          <span>Demo Student Login</span>
        </Button>

        <div className="flex-between mb-6" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
          <button
            type="button"
            onClick={handleAutoFill}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-color)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              padding: 0,
            }}
          >
            Auto-fill demo credentials
          </button>
          <Link to="/admin/login" className="text-accent" style={{ fontSize: '0.8rem' }}>
            Admin Portal &rarr;
          </Link>
        </div>

        <div className="text-sm" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          New member?{' '}
          <Link to="/register" className="text-accent" style={{ fontWeight: 500 }}>
            Create account
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

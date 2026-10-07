import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export const AdminLogin: React.FC = () => {
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
      const user = await login(email.trim().toLowerCase(), password);
      if (['admin', 'super_admin'].includes(user.role?.toLowerCase())) {
        navigate('/admin');
      } else {
        setError('Access denied: Admin privileges required for this portal.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify admin credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAdmin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await login('admin@aiclub.com', 'admin123');
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Unable to connect to AI CLUB server for admin login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Admin Portal"
      subtitle="Restricted access. Sign in with administrative credentials."
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Admin Email"
          type="email"
          placeholder="admin@aiclub.com"
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

        {error && <div className="form-error mb-4" role="alert">{error}</div>}

        <Button
          type="submit"
          isLoading={isLoading}
          className="mb-4 mt-6"
          style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
        >
          Sign In as Admin
        </Button>

        {import.meta.env.DEV && <>
        <div className="auth-divider">
          <span>OR</span>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="demo-btn mb-4"
          onClick={handleDemoAdmin}
          disabled={isLoading}
        >
          Demo Admin Access
        </Button>
        </>}

        <div className="text-sm" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Link to="/login" className="text-accent" style={{ fontWeight: 500 }}>
            Return to Student Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

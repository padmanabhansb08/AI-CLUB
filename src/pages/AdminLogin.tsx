import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authService } from '../services/authService';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login(email, password);
      if (response.success) {
        console.log('Admin Login successful');
        navigate('/admin'); 
      } else {
        console.error('Admin Login failed:', response.message);
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      console.error('Admin Login exception:', err);
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Admin Portal"
      subtitle="Restricted access. Sign in with admin credentials."
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Admin Email"
          type="email"
          placeholder="admin@college.edu"
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

        {error && <div className="form-error mb-4">{error}</div>}

        <Button type="submit" isLoading={isLoading} className="mb-4 mt-6" style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}>
          Sign In as Admin
        </Button>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="demo-btn mb-4"
          onClick={() => {
            authService.loginAsDemo('admin');
            navigate('/admin');
          }}
          disabled={isLoading}
        >
          Demo Admin Access
        </Button>

        <div className="text-sm" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Link to="/" className="text-accent" style={{ fontWeight: 500 }}>
            Return to Student Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

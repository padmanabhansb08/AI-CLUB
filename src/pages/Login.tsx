import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authService } from '../services/authService';

export const Login: React.FC = () => {
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
        // Handle successful login routing
        console.log('Login successful');
        navigate('/dashboard');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
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
          placeholder="student@college.edu"
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

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { authService } from '../services/authService';
import { YEAR_OPTIONS, DEPARTMENT_OPTIONS, SECTION_OPTIONS } from '../constants/academicOptions';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    registerNumber: '',
    department: '',
    classSection: '',
    year: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = 'Required';
    if (!formData.registerNumber) newErrors.registerNumber = 'Required';
    if (!formData.department) newErrors.department = 'Required';
    if (!formData.classSection) newErrors.classSection = 'Required';
    if (!formData.year) newErrors.year = 'Required';
    
    if (!formData.email) {
      newErrors.email = 'Required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.phone) newErrors.phone = 'Required';
    
    if (!formData.password) {
      newErrors.password = 'Required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Min 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        collegeEmail: formData.email,
        year: parseInt(formData.year, 10)
      };

      const response = await authService.registerStudent(payload);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setErrors({ submit: response.error || 'Registration failed' });
      }
    } catch (err: any) {
      setErrors({ submit: err.message || 'An error occurred during registration' });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        title="Registration Successful"
        subtitle="Welcome to the AI Club!"
      >
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <div style={{ color: 'var(--success-color)', fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Your account has been created. Redirecting to login...
          </p>
          <Button onClick={() => navigate('/')}>Go to Login</Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join the AI Club community"
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Full Name"
          name="fullName"
          placeholder="John Doe"
          value={formData.fullName}
          onChange={handleChange}
          error={errors.fullName}
          required
        />

        <div className="form-row">
          <Input
            label="Register Number"
            name="registerNumber"
            placeholder="12345678"
            value={formData.registerNumber}
            onChange={handleChange}
            error={errors.registerNumber}
            required
          />
          <Select
            label="Year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            error={errors.year}
            placeholder="Select Year"
            options={YEAR_OPTIONS}
            required
          />
        </div>

        <div className="form-row">
          <Select
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            error={errors.department}
            placeholder="Select Department"
            options={DEPARTMENT_OPTIONS}
            required
          />
          <Select
            label="Class / Section"
            name="classSection"
            value={formData.classSection}
            onChange={handleChange}
            error={errors.classSection}
            placeholder="Select Section"
            options={SECTION_OPTIONS}
            required
          />
        </div>

        <Input
          label="College Email"
          name="email"
          type="email"
          placeholder="student@college.edu"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <Input
          label="Phone Number"
          name="phone"
          type="tel"
          placeholder="+1 234 567 8900"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          required
        />

        <div className="form-row">
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
          />
        </div>

        {errors.submit && <div className="form-error mb-4">{errors.submit}</div>}

        <Button type="submit" isLoading={isLoading} className="mb-4 mt-6">
          Register
        </Button>

        <div className="text-sm" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/" className="text-accent" style={{ fontWeight: 500 }}>
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

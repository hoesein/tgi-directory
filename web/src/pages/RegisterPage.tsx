import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../store/authStore';
import { registerSchema, type RegisterInput } from '../types';

export default function RegisterPage() {
  const { signIn } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = () => {
    setLoading(true);
    setError('');

    // Skip auth - directly sign in with dummy token
    signIn('dummy-token');
    navigate('/');

    setLoading(false);
  };

  return (
    <div className="auth-wrap">
      <h1>Register</h1>
      {error ? <p className="form-error">{error}</p> : null}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" type="text" {...register('name')} />
        </div>
        {errors.name && <p className="field-error">{errors.name.message}</p>}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" {...register('email')} />
        </div>
        {errors.email && <p className="field-error">{errors.email.message}</p>}

        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" {...register('password')} />
        </div>
        {errors.password && <p className="field-error">{errors.password.message}</p>}

        <div className="field">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input id="confirmPassword" type="password" {...register('confirmPassword')} />
        </div>
        {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Please wait…' : 'Register'}
        </button>
      </form>
      <Link to="/login" className="btn-text" style={{ textAlign: 'center', display: 'block' }}>
        Already have an account? Login
      </Link>
    </div>
  );
}

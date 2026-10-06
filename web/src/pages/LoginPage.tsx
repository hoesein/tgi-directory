import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../store/authStore';
import { loginSchema, type LoginInput } from '../types';

export default function LoginPage() {
  const { signIn } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
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
      <h1>Login</h1>
      {error ? <p className="form-error">{error}</p> : null}

      <form onSubmit={handleSubmit(onSubmit)}>
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

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Please wait…' : 'Login'}
        </button>
      </form>
      <Link to="/register" className="btn-text" style={{ textAlign: 'center', display: 'block' }}>
        Don&apos;t have an account? Register
      </Link>
    </div>
  );
}

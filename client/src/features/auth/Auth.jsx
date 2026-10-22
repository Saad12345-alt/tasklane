import { useState } from 'react';
import { api } from '@/lib/api';

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const register = mode === 'register';

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      onAuth(await api(`/auth/${mode}`, { method: 'POST', body: Object.fromEntries(new FormData(e.target)) }));
    } catch (err) {
      setError(err.message);
    }
  };
  const switchMode = () => {
    setError('');
    setMode(register ? 'login' : 'register');
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form key={mode} onSubmit={submit} className="-mt-16 flex w-full max-w-[375px] flex-col gap-5">
        <h1 className="mb-1 text-lg font-semibold">Tasklane</h1>

        {register && (
          <label>
            <span className="label">Name</span>
            <input name="name" required autoComplete="name" placeholder="Your name" className="field" />
          </label>
        )}
        <label>
          <span className="label">Email</span>
          <input name="email" type="email" required autoComplete="email" placeholder="you@company.com" className="field" />
        </label>
        <label>
          <span className="label">Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={register ? 8 : undefined}
            autoComplete={register ? 'new-password' : 'current-password'}
            placeholder={register ? 'At least 8 characters' : ''}
            aria-invalid={!!error}
            className="field"
          />
          {error && <span role="alert" className="mt-2 block text-accent">{error}</span>}
        </label>

        <button className="btn min-h-11">{register ? 'Create account' : 'Sign in'}</button>
        <p className="text-muted">
          {register ? 'Have an account? ' : 'Need an account? '}
          <button type="button" onClick={switchMode} className="link text-ink">{register ? 'Sign in' : 'Register'}</button>
        </p>
      </form>
    </main>
  );
}

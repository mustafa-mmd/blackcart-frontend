import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password, true);
      navigate('/admin/dashboard');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600"><Lock className="h-6 w-6 text-white" /></div>
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">Private Admin Login</h1>
          <p className="mt-2 text-sm text-gray-600">BlackCart.store administration only</p>
        </div>
        <form className="space-y-6 rounded-xl bg-white p-6 shadow" onSubmit={handleSubmit}>
          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <label className="block text-sm font-medium text-gray-700">
            Admin email
            <span className="relative mt-1 block"><Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" /><input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3" /></span>
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Password
            <span className="relative mt-1 block"><Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" /><input type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3" /></span>
          </label>
          <button type="submit" disabled={loading} className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50">{loading ? 'Signing in…' : 'Sign in as Admin'}</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;

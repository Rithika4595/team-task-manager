import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'MEMBER' });
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/signup', form);
      setAuth(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Create Account</h1>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <form onSubmit={submit} className="space-y-4">
          <input className="w-full border rounded-lg px-4 py-2" placeholder="Full Name"
            value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input className="w-full border rounded-lg px-4 py-2" placeholder="Email"
            type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <input className="w-full border rounded-lg px-4 py-2" placeholder="Password"
            type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          <select className="w-full border rounded-lg px-4 py-2"
            value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Sign Up</button>
        </form>
        <p className="mt-4 text-sm text-center">Have account? <Link to="/login" className="text-blue-600">Sign in</Link></p>
      </div>
    </div>
  );
}
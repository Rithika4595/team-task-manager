import { useEffect, useState } from 'react';
import api from '../api/Axios';
import { useAuthStore } from '../store/authStore';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuthStore();

  const load = () => api.get('/projects').then(r => setProjects(r.data));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post('/projects', form);
    setForm({ name: '', description: '' });
    setShowForm(false);
    load();
  };

  const remove = async (id) => {
    await api.delete(`/projects/${id}`);
    load();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        {user?.role === 'ADMIN' && (
          <button onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
            + New Project
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={create} className="bg-white p-4 rounded-xl shadow mb-6 space-y-3">
          <input className="w-full border rounded-lg px-4 py-2" placeholder="Project name"
            value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <input className="w-full border rounded-lg px-4 py-2" placeholder="Description"
            value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Create</button>
        </form>
      )}

      <div className="grid gap-4">
        {projects.map(p => (
          <div key={p.id} className="bg-white p-4 rounded-xl shadow flex justify-between items-start">
            <div>
              <h2 className="font-semibold">{p.name}</h2>
              <p className="text-sm text-gray-500">{p.description}</p>
              <p className="text-xs text-gray-400 mt-1">{p._count?.tasks || 0} tasks · {p.members?.length || 0} members</p>
            </div>
            {user?.role === 'ADMIN' && (
              <button onClick={() => remove(p.id)} className="text-red-400 text-xs hover:text-red-600">Delete</button>
            )}
          </div>
        ))}
        {projects.length === 0 && <p className="text-gray-400 text-sm">No projects yet.</p>}
      </div>
    </div>
  );
}

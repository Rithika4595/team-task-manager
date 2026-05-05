import { useEffect, useState } from 'react';
import api from '../api/Axios';
import { useAuthStore } from '../store/authStore';

const STATUS_COLORS = {
  TODO: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  DONE: 'bg-green-100 text-green-700',
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', projectId: '', dueDate: '', priority: 'MEDIUM' });
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuthStore();

  const load = () => api.get('/tasks').then(r => setTasks(r.data));
  useEffect(() => {
    load();
    api.get('/projects').then(r => setProjects(r.data));
  }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post('/tasks', form);
    setForm({ title: '', description: '', projectId: '', dueDate: '', priority: 'MEDIUM' });
    setShowForm(false);
    load();
  };

  const updateStatus = async (id, status) => {
    await api.put(`/tasks/${id}`, { status });
    load();
  };

  const remove = async (id) => {
    await api.delete(`/tasks/${id}`);
    load();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        {user?.role === 'ADMIN' && (
          <button onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
            + New Task
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={create} className="bg-white p-4 rounded-xl shadow mb-6 space-y-3">
          <input className="w-full border rounded-lg px-4 py-2" placeholder="Task title"
            value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          <input className="w-full border rounded-lg px-4 py-2" placeholder="Description"
            value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <select className="w-full border rounded-lg px-4 py-2"
            value={form.projectId} onChange={e => setForm({...form, projectId: e.target.value})} required>
            <option value="">Select project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select className="w-full border rounded-lg px-4 py-2"
            value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <input className="w-full border rounded-lg px-4 py-2" type="date"
            value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Create Task</button>
        </form>
      )}

      <div className="grid gap-3">
        {tasks.map(t => (
          <div key={t.id} className="bg-white p-4 rounded-xl shadow flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-semibold">{t.title}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[t.status]}`}>{t.status}</span>
                <span className="text-xs text-gray-400">{t.priority}</span>
              </div>
              <p className="text-sm text-gray-500">{t.description}</p>
              <p className="text-xs text-gray-400 mt-1">
                {t.project?.name} · {t.assignee?.name || 'Unassigned'}
                {t.dueDate && ` · Due ${new Date(t.dueDate).toLocaleDateString()}`}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <select className="text-xs border rounded px-2 py-1"
                value={t.status} onChange={e => updateStatus(t.id, e.target.value)}>
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
              {user?.role === 'ADMIN' && (
                <button onClick={() => remove(t.id)} className="text-red-400 text-xs hover:text-red-600">Delete</button>
              )}
            </div>
          </div>
        ))}
        {tasks.length === 0 && <p className="text-gray-400 text-sm">No tasks yet.</p>}
      </div>
    </div>
  );
}

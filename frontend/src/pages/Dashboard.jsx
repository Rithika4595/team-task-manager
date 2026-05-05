import { useEffect, useState } from 'react';
import api from '../api/Axios';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setStats(r.data));
  }, []);

  if (!stats) return <div className="p-6">Loading...</div>;

  const cards = [
    { label: 'Total Tasks', value: stats.total, color: 'bg-blue-50 text-blue-700' },
    { label: 'To Do', value: stats.todo, color: 'bg-gray-50 text-gray-700' },
    { label: 'In Progress', value: stats.inProgress, color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Done', value: stats.done, color: 'bg-green-50 text-green-700' },
    { label: 'Overdue', value: stats.overdue, color: 'bg-red-50 text-red-700' },
    { label: 'Projects', value: stats.projects, color: 'bg-purple-50 text-purple-700' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map(c => (
          <div key={c.label} className={`rounded-xl p-4 ${c.color}`}>
            <p className="text-sm opacity-70">{c.label}</p>
            <p className="text-3xl font-bold mt-1">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

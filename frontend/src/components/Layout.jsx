import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen">
      <aside className="w-56 bg-gray-900 text-white flex flex-col p-4">
        <h1 className="text-lg font-bold mb-8">TaskManager</h1>
        <nav className="flex-1 space-y-1">
          {[['/', 'Dashboard'], ['/projects', 'Projects'], ['/tasks', 'Tasks']].map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto">
          <p className="text-xs text-gray-400 mb-1">{user?.name}</p>
          <p className="text-xs text-gray-500 mb-3">{user?.role}</p>
          <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300">Logout</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
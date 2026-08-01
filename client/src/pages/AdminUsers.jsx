import { useState, useEffect } from 'react';
import api from '../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/users');
        setUsers(data.users);
      } catch (err) {
        setError('Failed to fetch administrative user accounts');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-display font-bold text-2xl">User Accounts</h1>
        <p className="text-xs text-white/40 mt-1">Audit customer database profiles and administrative assignments</p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold text-center">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 skeleton rounded-xl"></div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-white/40">
                  <th className="p-4">User Details</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Member Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-white/[0.01] transition-all">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-xs uppercase shrink-0">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-white block truncate max-w-[180px]">{u.name}</span>
                        <span className="text-[10px] font-mono text-white/35 block truncate max-w-[180px]">{u._id}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'Admin'
                            ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                            : 'bg-white/5 text-white/60 border border-white/10'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-white/70">{u.email}</td>
                    <td className="p-4 text-white/50">
                      {new Date(u.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

import useAuth from '../hooks/useAuth';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="page-container py-16 animate-fade-in-up">
      <div className="max-w-2xl mx-auto space-y-8 mt-8">
        <h2 className="section-title">My Profile</h2>

        <div className="glass space-y-6 rounded-lg border border-white/5 p-6 sm:p-8">
          <div className="flex flex-col gap-4 border-b border-white/5 pb-6 sm:flex-row sm:items-center sm:gap-6">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-2xl uppercase">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 text-center sm:text-left">
              <h3 className="break-anywhere font-display text-2xl font-bold text-white">{user?.name}</h3>
              <span className="px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-semibold text-orange-400">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-white/40 block mb-1">Email address</label>
              <p className="break-anywhere font-medium text-white/80">{user?.email}</p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-white/40 block mb-1">Member Since</label>
              <p className="text-white/80 font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

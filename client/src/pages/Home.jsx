const Home = () => {
  return (
    <div className="page-container py-16 animate-fade-in-up">
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl tracking-tight leading-tight">
          Welcome to <span className="gradient-text">Mini Daraz</span>
        </h1>
        <p className="text-lg text-white/50 leading-relaxed">
          Discover a state-of-the-art MERN university showcase project built with clean architecture, role-based access control, local multer uploads, and a premium dark aesthetics theme.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <a href="/products" className="btn-primary">
            Start Shopping
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
          <a href="/register" className="btn-secondary">
            Create Account
          </a>
        </div>
      </div>

      {/* Feature cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
        {[
          {
            title: 'MERN stack',
            desc: 'Built with React, Express, Node.js, and local MongoDB database using ES Modules.',
            icon: '⚡',
          },
          {
            title: 'Role-Based Access',
            desc: 'Complete RBAC middleware guarding customer checkouts and administrative dashboards.',
            icon: '🛡️',
          },
          {
            title: 'Multer Uploads',
            desc: 'Physical storage of uploaded product image assets with automatic file sanitization.',
            icon: '📁',
          },
        ].map((feat) => (
          <div key={feat.title} className="glass p-8 rounded-2xl border border-white/5 card-hover">
            <span className="text-3xl mb-4 block">{feat.icon}</span>
            <h3 className="font-display font-bold text-xl mb-2 text-white">{feat.title}</h3>
            <p className="text-sm text-white/40 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;

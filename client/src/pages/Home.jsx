import useAuth from '../hooks/useAuth';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="page-container py-16 animate-fade-in-up">
      <div className="text-center max-w-3xl mx-auto space-y-6 mt-26">
        <h1 className="font-display text-4xl font-extrabold leading-tight sm:text-6xl">
          Welcome to <span className="gradient-text">Mini Daraz</span>
        </h1>
        <p className="text-lg text-white/50 leading-relaxed">
          Discover a state-of-the-art MERN university showcase project built with clean architecture, role-based access control, local multer uploads, and a bright polished shopping experience.
        </p>
        <div className="flex flex-col justify-center gap-3 pt-4 sm:flex-row sm:gap-4">
          <a href="/products" className="btn-primary">
            Start Shopping
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
          {!isAuthenticated && (
            <a href="/register" className="btn-secondary">
              Create Account
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

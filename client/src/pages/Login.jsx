import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import useAuth from "../hooks/useAuth";

const Login = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loadingState, setLoadingState] = useState(false);

  // Disable background scrolling
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoadingState(true);

    const res = await login(email, password);

    setLoadingState(false);

    if (res.success) {
      if (res.user.role === "Admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } else {
      setError(res.message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoadingState(true);

    const res = await googleLogin(credentialResponse.credential);

    setLoadingState(false);

    if (res.success) {
      if (res.user.role === "Admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } else {
      setError(res.message);
    }
  };

  const handleGoogleError = () => {
    setError("Google Sign-In failed. Please try again.");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Blur Overlay */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-md"></div>

      {/* Login Card */}
      <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center overflow-y-auto p-4 backdrop-blur-sm animate-fade-in-up">
        <div className="w-full max-w-md space-y-6 rounded-lg border border-white/10 p-6 glass sm:p-8">
          <div className="text-center space-y-2">
            <h2 className="font-display font-bold text-3xl">Welcome Back</h2>

            <p className="text-sm text-white/40">
              Log in to manage your cart and orders
            </p>
          </div>

          {error && (
            <div
              className="
              mt-5
              p-3
              bg-red-500/10
              border
              border-red-500/20
              text-red-500
              rounded-lg
              text-xs
              font-semibold
              text-center
              "
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Email Address
              </label>

              <input
                type="email"
                required
                className="
                w-full
                mt-2
                rounded-lg
                border
                border-gray-200
                bg-white
                px-4
                py-3
                text-gray-900
                outline-none
                focus:border-orange-500
                "
                placeholder="customer@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Password
              </label>

              <input
                type="password"
                required
                className="
                w-full
                mt-2
                rounded-lg
                border
                border-gray-200
                bg-white
                px-4
                py-3
                text-gray-900
                outline-none
                focus:border-orange-500
                "
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loadingState}
              className="
              w-full
              h-11
              rounded-lg
              bg-orange-500
              text-white
              font-semibold
              hover:bg-orange-600
              transition
              "
            >
              {loadingState ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 border-t border-gray-200"></div>

            <span className="text-xs text-gray-400">OR</span>

            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              shape="rectangular"
              width="100%"
            />
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-orange-500 font-semibold">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

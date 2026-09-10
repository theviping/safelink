import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, ArrowRight, Mail, Lock } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    setError("");

    const savedUser = JSON.parse(localStorage.getItem("safelinkUser"));

    if (!savedUser) {
      setError("No account found. Please create an account first.");
      return;
    }

    if (
      savedUser.email !== email ||
      savedUser.password !== password
    ) {
      setError("Invalid email or password.");
      return;
    }

    localStorage.setItem("safelinkLoggedIn", "true");

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] px-6 text-white">

      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center">

        {/* Logo */}
        <Link
          to="/"
          className="mx-auto mb-10 flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
            <Shield size={25} />
          </div>

          <span className="text-2xl font-bold">
            Safe<span className="text-red-500">Link</span>
          </span>
        </Link>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl">

          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              Welcome back
            </h1>

            <p className="mt-2 text-slate-400">
              Sign in to your SafeLink account.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 outline-none transition focus:border-red-500/50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 outline-none transition focus:border-red-500/50"
                />
              </div>
            </div>

            {/* Login */}
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-3.5 font-semibold transition hover:bg-red-600"
            >
              Sign In
              <ArrowRight size={18} />
            </button>

          </form>

          <p className="mt-7 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-red-400 hover:text-red-300"
            >
              Create one
            </Link>
          </p>

        </div>

        {/* Back */}
        <Link
          to="/"
          className="mt-6 text-center text-sm text-slate-500 hover:text-white"
        >
          ← Back to SafeLink
        </Link>

      </div>
    </div>
  );
};

export default Login;
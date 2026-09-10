import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  ArrowRight,
  User,
  Mail,
  Lock,
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();

    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const user = {
      name,
      email,
      password,
    };

    localStorage.setItem(
      "safelinkUser",
      JSON.stringify(user)
    );

    localStorage.setItem(
      "safelinkLoggedIn",
      "true"
    );

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] px-6 text-white">

      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center py-10">

        {/* Logo */}
        <Link
          to="/"
          className="mx-auto mb-8 flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
            <Shield size={25} />
          </div>

          <span className="text-2xl font-bold">
            Safe<span className="text-red-500">Link</span>
          </span>
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl">

          <div className="mb-7">
            <h1 className="text-3xl font-bold">
              Create account
            </h1>

            <p className="mt-2 text-slate-400">
              Build your trusted emergency network.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form
            onSubmit={handleRegister}
            className="space-y-4"
          >

            {/* Name */}
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Full Name
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 outline-none focus:border-red-500/50"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm text-slate-300">
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
                  className="w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 outline-none focus:border-red-500/50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm text-slate-300">
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
                  placeholder="Minimum 6 characters"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 outline-none focus:border-red-500/50"
                />
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Confirm Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Repeat your password"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 outline-none focus:border-red-500/50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-3.5 font-semibold transition hover:bg-red-600"
            >
              Create Account
              <ArrowRight size={18} />
            </button>

          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-red-400 hover:text-red-300"
            >
              Sign in
            </Link>
          </p>

        </div>

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

export default Register;
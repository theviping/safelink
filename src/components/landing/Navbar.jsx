import { Menu, X, Shield } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-[#0b0f19]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
            <Shield size={25} />
          </div>

          <span className="text-xl font-bold tracking-tight">
            Safe<span className="text-red-500">Link</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">

          <a
            href="/#features"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            Features
          </a>

          <a
            href="/#how-it-works"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            How it Works
          </a>

          <a
            href="/#about"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            About
          </a>

          {/* Sign In */}
          <Link
            to="/login"
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium transition hover:bg-white/5"
          >
            Sign In
          </Link>

          {/* Get Started */}
          <Link
            to="/register"
            className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="text-white md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t border-white/10 bg-[#0b0f19] px-6 py-6 md:hidden">
          <div className="flex flex-col gap-5">

            <a
              href="/#features"
              onClick={closeMenu}
              className="text-slate-300 hover:text-white"
            >
              Features
            </a>

            <a
              href="/#how-it-works"
              onClick={closeMenu}
              className="text-slate-300 hover:text-white"
            >
              How it Works
            </a>

            <a
              href="/#about"
              onClick={closeMenu}
              className="text-slate-300 hover:text-white"
            >
              About
            </a>

            <Link
              to="/login"
              onClick={closeMenu}
              className="rounded-xl border border-white/10 px-5 py-3 text-center"
            >
              Sign In
            </Link>

            <Link
              to="/register"
              onClick={closeMenu}
              className="rounded-xl bg-red-500 px-5 py-3 text-center font-semibold"
            >
              Get Started
            </Link>

          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
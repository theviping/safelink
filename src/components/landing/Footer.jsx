const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-[#0b0f19]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

        {/* Top Section */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-xl text-red-500">
                ♢
              </div>

              <span className="text-xl font-bold tracking-tight text-white">
                Safe<span className="text-red-500">Link</span>
              </span>
            </div>

            <p className="mt-5 max-w-md leading-7 text-slate-400">
              SafeLink helps people stay connected, share critical information,
              and coordinate emergency responses when every second matters.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex gap-3">

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-sm font-bold text-slate-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
              >
                GH
              </a>

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-sm font-bold text-slate-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
              >
                IG
              </a>

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-sm font-bold text-slate-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
              >
                X
              </a>

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-sm font-bold text-slate-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
              >
                IN
              </a>

            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold text-white">
              Platform
            </h3>

            <ul className="mt-5 space-y-3">

              <li>
                <a
                  href="#features"
                  className="text-sm text-slate-400 transition hover:text-red-400"
                >
                  Features
                </a>
              </li>

              <li>
                <a
                  href="#how-it-works"
                  className="text-sm text-slate-400 transition hover:text-red-400"
                >
                  How It Works
                </a>
              </li>

              <li>
                <a
                  href="#about"
                  className="text-sm text-slate-400 transition hover:text-red-400"
                >
                  About Us
                </a>
              </li>

            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white">
              Support
            </h3>

            <ul className="mt-5 space-y-3">

              <li>
                <a
                  href="#"
                  className="text-sm text-slate-400 transition hover:text-red-400"
                >
                  Help Center
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-sm text-slate-400 transition hover:text-red-400"
                >
                  Privacy Policy
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-sm text-slate-400 transition hover:text-red-400"
                >
                  Terms of Service
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-sm text-slate-400 transition hover:text-red-400"
                >
                  Contact
                </a>
              </li>

            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">

          <p className="text-sm text-slate-500">
            © 2026 SafeLink. All rights reserved.
          </p>

          <p className="text-sm text-slate-500">
            Made with <span className="text-red-500">♥</span> for safer communities
          </p>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
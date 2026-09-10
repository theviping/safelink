import { ArrowRight, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const EmergencyCTA = () => {
  return (
    <section className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-500/10 via-[#121621] to-[#0b0f19] px-6 py-20 text-center sm:px-12"
        >

          {/* Glow */}
          <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-red-500/10 blur-[100px]" />

          <div className="relative">

            {/* Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
              <Shield size={28} />
            </div>

            {/* Small heading */}
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.25em] text-red-400">
              Be Prepared. Stay Safe.
            </p>

            {/* Heading */}
            <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
              Every second matters
              <span className="block text-red-500">
                in an emergency.
              </span>
            </h2>

            {/* Description */}
            <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">
              Build your trusted safety network today and be ready when it
              matters most.
            </p>

            {/* Button */}
            <Link
              to="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-red-500 px-8 py-4 font-semibold text-white transition hover:scale-105 hover:bg-red-600"
            >
              Get Started Now
              <ArrowRight size={18} />
            </Link>

          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default EmergencyCTA;
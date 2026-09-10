import {
  ArrowRight,
  ShieldCheck,
  Radio,
  Users,
} from "lucide-react";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden pt-28">

      {/* Background Glow */}
      <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-red-500/10 blur-[120px]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-7rem)] max-w-7xl flex-col items-center justify-center px-6 text-center lg:px-8">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400"
        >
          <Radio size={16} />
          Emergency Response Platform
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-8xl"
        >
          When Every Second Matters,

          <span className="block bg-gradient-to-r from-red-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
            Stay Connected.
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-7 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg"
        >
          SafeLink helps people connect, find loved ones, request help, and
          coordinate emergency responses when disaster strikes.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >

          {/* Get Started */}
          <Link
            to="/register"
            className="flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-7 py-4 font-semibold transition hover:scale-105 hover:bg-red-600"
          >
            Get Started
            <ArrowRight size={18} />
          </Link>

          {/* Explore Features */}
          <a
            href="#features"
            className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 font-semibold transition hover:bg-white/10"
          >
            Explore Features
          </a>

        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-20 grid w-full max-w-3xl grid-cols-3 divide-x divide-white/10 border-y border-white/10 py-6"
        >

          <div>
            <ShieldCheck
              className="mx-auto mb-2 text-green-400"
              size={22}
            />
            <p className="text-sm font-medium">
              Stay Safe
            </p>
          </div>

          <div>
            <Users
              className="mx-auto mb-2 text-blue-400"
              size={22}
            />
            <p className="text-sm font-medium">
              Stay Connected
            </p>
          </div>

          <div>
            <Radio
              className="mx-auto mb-2 text-orange-400"
              size={22}
            />
            <p className="text-sm font-medium">
              Respond Faster
            </p>
          </div>

        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
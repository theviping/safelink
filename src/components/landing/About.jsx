import { ShieldCheck, HeartHandshake, Users } from "lucide-react";
import { motion } from "framer-motion";

const values = [
  {
    icon: ShieldCheck,
    title: "Safety First",
    description:
      "Your safety and privacy are at the heart of everything we build.",
  },
  {
    icon: HeartHandshake,
    title: "Built for Communities",
    description:
      "Helping people support each other when emergencies and disasters happen.",
  },
  {
    icon: Users,
    title: "Stronger Together",
    description:
      "Connecting communities makes emergency response faster and more effective.",
  },
];

const About = () => {
  return (
    <section
      id="about"
      className="relative border-t border-white/5 py-24 sm:py-32"
    >
      {/* Background Glow */}
      <div className="absolute right-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-red-500/5 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
              About SafeLink
            </span>

            <h2 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              Built for the moments
              <span className="block text-red-500">
                that matter most.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
              SafeLink is designed to help people stay connected during
              emergencies. When communication becomes difficult, we provide
              tools that help communities coordinate, share information, and
              respond faster.
            </p>

            <p className="mt-5 max-w-xl leading-8 text-slate-500">
              Our mission is simple: make emergency communication faster,
              easier, and accessible when people need it the most.
            </p>

            {/* Stats */}
            <div className="mt-10 flex gap-10">
              <div>
                <h3 className="text-3xl font-bold text-white">24/7</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Emergency Support
                </p>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-white">Fast</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Response Network
                </p>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-red-500">Safe</h3>
                <p className="mt-1 text-sm text-slate-500">
                  & Secure
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid gap-5"
          >
            {values.map((value, index) => {
              const Icon = value.icon;

              return (
                <div
                  key={value.title}
                  className="group flex gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition duration-300 hover:border-red-500/30 hover:bg-white/[0.04]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                    <Icon size={22} />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">
                      {value.title}
                    </h3>

                    <p className="mt-2 leading-7 text-slate-400">
                      {value.description}
                    </p>
                  </div>

                  <span className="ml-auto text-4xl font-bold text-white/5">
                    0{index + 1}
                  </span>
                </div>
              );
            })}
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default About;
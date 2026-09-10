import { MapPin, Radio, Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    icon: MapPin,
    title: "Share Your Location",
    description:
      "Quickly share your real-time location with trusted contacts when you need help.",
  },
  {
    number: "02",
    icon: Radio,
    title: "Send an SOS",
    description:
      "Trigger an emergency alert and instantly notify nearby people and contacts.",
  },
  {
    number: "03",
    icon: Users,
    title: "Get Connected",
    description:
      "Coordinate with your community, receive updates, and get help faster.",
  },
];

const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden border-t border-white/5 py-24 sm:py-32"
    >
      {/* Background Glow */}
      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/5 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-20 max-w-2xl text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
            How It Works
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Help is just
            <span className="block text-red-500"> three steps away.</span>
          </h2>

          <p className="mt-5 leading-7 text-slate-400">
            SafeLink makes emergency communication simple, fast, and reliable
            when every second matters.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative grid gap-8 lg:grid-cols-3 lg:gap-12">
          
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.15,
                }}
                className="relative"
              >
                
                {/* Step Card */}
                <div className="relative rounded-3xl border border-white/10 bg-white/[0.02] p-8 transition duration-300 hover:-translate-y-2 hover:border-red-500/30 hover:bg-white/[0.04]">
                  
                  {/* Number */}
                  <span className="absolute right-7 top-6 text-5xl font-bold text-white/5">
                    {step.number}
                  </span>

                  {/* Icon */}
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
                    <Icon size={26} />
                  </div>

                  <h3 className="mt-7 text-xl font-semibold">
                    {step.title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-400">
                    {step.description}
                  </p>

                  {/* Bottom Line */}
                  <div className="mt-7 h-px w-full bg-gradient-to-r from-red-500/30 to-transparent" />
                </div>

                {/* Arrow Between Cards */}
                {index < steps.length - 1 && (
                  <div className="absolute -right-9 top-1/2 hidden -translate-y-1/2 text-slate-600 lg:block">
                    <ArrowRight size={28} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
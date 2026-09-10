import {
  MapPin,
  Radio,
  Users,
  AlertTriangle,
  WifiOff,
  BellRing,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: MapPin,
    title: "Live Location Sharing",
    description:
      "Share your real-time location with trusted contacts during emergencies.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Radio,
    title: "Emergency SOS",
    description:
      "Send an instant distress signal to nearby people and emergency contacts.",
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  {
    icon: Users,
    title: "Community Network",
    description:
      "Connect with people nearby to coordinate help and share critical updates.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: AlertTriangle,
    title: "Disaster Alerts",
    description:
      "Receive important alerts and safety information during critical situations.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    icon: WifiOff,
    title: "Offline Support",
    description:
      "Access essential emergency information even when internet connectivity fails.",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: BellRing,
    title: "Instant Notifications",
    description:
      "Stay informed with real-time updates from your emergency network.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
];

const Features = () => {
  return (
    <section
      id="features"
      className="relative border-t border-white/5 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
            Powerful Features
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Everything you need to
            <span className="block text-red-500"> stay connected.</span>
          </h2>

          <p className="mt-5 leading-7 text-slate-400">
            Built to help communities communicate, coordinate, and respond
            faster when unexpected situations happen.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                }}
                className="group rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition duration-300 hover:-translate-y-2 hover:border-white/20 hover:bg-white/[0.04]"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg} ${feature.color}`}
                >
                  <Icon size={23} />
                </div>

                <h3 className="mt-6 text-xl font-semibold">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {feature.description}
                </p>

                <div className="mt-6 h-px w-0 bg-white/30 transition-all duration-300 group-hover:w-full" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
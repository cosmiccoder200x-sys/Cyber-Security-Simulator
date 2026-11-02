import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Shield, Target, Users, Award } from "lucide-react";
import { SectionTitle } from "../components/SectionTitle";
import { CyberCard } from "../components/CyberCard";
import { AnimatedButton } from "../components/AnimatedButton";
import {
  phishingStats,
  scamTrends,
  threatActivity,
  weeklyTraining,
} from "../data/dashboardData";
import { staggerContainer, fadeInUp } from "../animations/variants";
import { cn } from "../utils/helpers";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 rounded-lg border border-neon-green/20 text-sm">
      <p className="text-white font-mono mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const aboutStats = [
  { icon: Shield, label: "Simulations", value: "6+" },
  { icon: Target, label: "Scenarios", value: "5+" },
  { icon: Users, label: "Quiz Questions", value: "10+" },
  { icon: Award, label: "Achievements", value: "6" },
];

export const About = () => {
  const severityColor = {
    critical: "text-danger border-danger/30 bg-danger/10",
    high: "text-warning border-warning/30 bg-warning/10",
    medium: "text-neon-cyan border-neon-cyan/30 bg-neon-cyan/10",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionTitle
        title="About Cyber Security Awareness Simulator"
        subtitle="Empowering individuals and organizations with hands-on cybersecurity training"
      />

      <CyberCard glow className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="font-display text-2xl text-white mb-4">Our Mission</h3>
            <p className="text-slate-400 leading-relaxed mb-4">
              The Cyber Security Awareness Simulator is an interactive training platform designed
              to teach real-world cybersecurity skills through safe, realistic simulations.
            </p>
            <p className="text-slate-400 leading-relaxed mb-6">
              From phishing email detection to password strength analysis, every module is built
              to mirror actual threats — without any real risk to your data or systems.
            </p>
            <AnimatedButton to="/phishing-simulator">Start Learning</AnimatedButton>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {aboutStats.map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-xl bg-white/5 border border-cyber-border">
                <stat.icon className="mx-auto text-neon-green mb-3" size={32} />
                <p className="text-2xl font-display font-bold text-white">{stat.value}</p>
                <p className="text-slate-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </CyberCard>

      {/* Global Threat Intelligence & Visualizations */}
      <SectionTitle
        title="Threat Intelligence & Trends"
        subtitle="Global threat telemetry and simulation insights monitored across the platform"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Phishing bar chart */}
        <CyberCard>
          <h3 className="text-white font-semibold mb-4">Phishing Attack Statistics</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={phishingStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="attacks" fill="#ff3366" name="Attacks" radius={[4, 4, 0, 0]} />
              <Bar dataKey="blocked" fill="#00ff88" name="Blocked" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CyberCard>

        {/* Scam pie chart */}
        <CyberCard>
          <h3 className="text-white font-semibold mb-4">Scam Type Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={scamTrends}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {scamTrends.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CyberCard>
      </div>

      <div className="mb-8">
        {/* Weekly training */}
        <CyberCard>
          <h3 className="text-white font-semibold mb-4">Weekly Active Users</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyTraining}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="users" fill="#00d4ff" name="Users" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CyberCard>
      </div>

      {/* Threat activity cards */}
      <h3 className="text-white font-semibold mb-4">Live Threat Activity</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {threatActivity.map((threat) => (
          <CyberCard key={threat.id} className={cn("border", severityColor[threat.severity])}>
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-white">{threat.type}</span>
              <span className={cn("text-xs font-mono uppercase px-2 py-0.5 rounded", severityColor[threat.severity])}>
                {threat.severity}
              </span>
            </div>
            <p className="text-2xl font-display font-bold text-white">{threat.count.toLocaleString()}</p>
            <p className="text-sm mt-1">
              Trend: <span className={threat.trend.startsWith("+") ? "text-danger" : "text-neon-green"}>
                {threat.trend}
              </span>
            </p>
          </CyberCard>
        ))}
      </div>

      {/* Tech stack */}
      <CyberCard>
        <h3 className="font-display text-xl text-white mb-4">Built With</h3>
        <div className="flex flex-wrap gap-3">
          {["React", "Vite", "Tailwind CSS", "Framer Motion", "Recharts", "React Router", "Lucide Icons"].map(
            (tech) => (
              <span
                key={tech}
                className="px-4 py-2 rounded-full border border-neon-green/30 text-neon-green text-sm font-mono bg-neon-green/5"
              >
                {tech}
              </span>
            )
          )}
        </div>
      </CyberCard>
    </div>
  );
};

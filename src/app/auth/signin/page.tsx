"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  GanttChartSquare,
  LayoutDashboard,
  Layers,
  LogIn,
  AlertTriangle,
  Moon,
  Sun,
} from "lucide-react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import dynamic from "next/dynamic";

// Dynamically import KanbanBoard to reduce initial bundle size
const KanbanBoard = dynamic<{ demoMode: boolean }>(
  () => import("../../../components/KanbanBoard"),
  { ssr: false }
);

const roles = [
  "Marketing",
  "Design",
  "Finance",
  "Supply Chain",
  "Project Manager",
];
const teamSizes = ["1-10", "11-50", "51-100", "100+"];

export default function LandingPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedTeamSize, setSelectedTeamSize] = useState<string>("");
  const [showCTAForm, setShowCTAForm] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Toggle theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const testimonials = [
    {
      quote: "LaunchPad transformed our seasonal collections.",
      author: "Priya K.",
      role: "Head of Design",
    },
    {
      quote: "Bye-bye, spreadsheets! Automated alerts keep us accountable.",
      author: "Amit S.",
      role: "Finance Lead",
    },
    {
      quote: "LaunchPad connects marketing and supply chain seamlessly.",
      author: "Sunita M.",
      role: "Supply Chain Director",
    },
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Personalized feature suggestions based on role
  const personalizedFeatures = selectedRole
    ? {
      Marketing:
        "Dynamic campaign tracking and automated alerts for deadlines.",
      Design:
        "Visual Kanban boards for creative workflows and asset management.",
      Finance: "Budget tracking and expense sync across projects.",
      "Supply Chain":
        "Real-time inventory updates and supplier coordination.",
      "Project Manager":
        "Gantt charts and cross-department task dependencies.",
    }[selectedRole] || "Tailored features for your role."
    : "";

  // Mock analytics tracking
  const trackEvent = (event: string, data: Record<string, unknown>) => {
    console.log(`Event: ${event} `, data);
  };

  // Handle CTA form submission
  const handleCTASubmit = () => {
    trackEvent("cta_submit", { role: selectedRole, teamSize: selectedTeamSize });
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-slate-900 text-white" : "bg-gray-100 text-black"}`}>
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <GanttChartSquare className="h-8 w-8 text-blue-500" />
              <span className="ml-3 text-2xl font-bold">LaunchPad</span>
            </div>
            <nav
              className="hidden md:flex md:items-center md:gap-8"
              role="navigation"
              aria-label="Main navigation"
            >
              <a
                href="#features"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#demo"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Live Demo
              </a>
              <a
                href="#testimonials"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Testimonials
              </a>
            </nav>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 transition-colors"
              >
                <LogIn size={16} /> Sign In
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="pt-16">
        {/* Hero Section with Parallax */}
        <section className="relative py-20 sm:py-28 lg:py-32 bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"
            animate={{ y: [0, 20, 0] }}
            transition={{ repeat: Infinity, duration: 10 }}
          />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white"
            >
              Coordinate Every Launch,{" "}
              <span className="block text-blue-400">Perfectly on Time.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-6 max-w-2xl mx-auto text-lg text-gray-300"
            >
              LaunchPad is your central hub for product launches, aligning teams
              and ensuring deadlines are met.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-8 flex justify-center gap-4"
            >
              <button
                onClick={() => setShowCTAForm(true)}
                className="flex items-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-lg hover:bg-blue-700 transition-transform hover:scale-105"
                aria-label="Get Started Free"
              >
                Get Started Free <ArrowRight size={20} />
              </button>
            </motion.div>
            <AnimatePresence>
              {showCTAForm && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="mt-8 max-w-md mx-auto bg-slate-800 p-6 rounded-lg shadow-xl"
                  role="dialog"
                  aria-label="Get Started Form"
                >
                  <h3 className="text-xl font-semibold mb-4">Tell us about you</h3>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="role"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Your Role
                      </label>
                      <select
                        id="role"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white py-2 px-3"
                      >
                        <option value="">Select a role</option>
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="teamSize"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Team Size
                      </label>
                      <select
                        id="teamSize"
                        value={selectedTeamSize}
                        onChange={(e) => setSelectedTeamSize(e.target.value)}
                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white py-2 px-3"
                      >
                        <option value="">Select team size</option>
                        {teamSizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedRole && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-blue-400"
                      >
                        {personalizedFeatures}
                      </motion.p>
                    )}
                    <div className="flex gap-4">
                      <button
                        onClick={() => setShowCTAForm(false)}
                        className="flex-1 rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCTASubmit}
                        disabled={!selectedRole || !selectedTeamSize}
                        className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-500"
                      >
                        Start Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 sm:py-24 bg-slate-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                All-in-One Launch Management
              </h2>
              <p className="mt-4 text-lg text-gray-400">
                Discover the features that make LaunchPad indispensable.
              </p>
            </motion.div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: LayoutDashboard,
                  title: "Visual Kanban Boards",
                  desc: "Track tasks with intuitive drag-and-drop boards.",
                },
                {
                  icon: Layers,
                  title: "Cross-Department Sync",
                  desc: "Align Marketing, Design, and Supply teams seamlessly.",
                },
                {
                  icon: AlertTriangle,
                  title: "Proactive Delay Alerts",
                  desc: "Get notified of overdue tasks automatically.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="flex flex-col items-center text-center p-6 bg-slate-900 rounded-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-base text-gray-400">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Demo Section */}
        <section id="demo" className="py-20 sm:py-24 bg-slate-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                See LaunchPad in Action
              </h2>
              <p className="mt-4 text-lg text-gray-400">
                Explore a live Kanban board demo without signing up.
              </p>
            </motion.div>
            <div className="bg-slate-800 p-6 rounded-lg shadow-xl">
              <KanbanBoard demoMode={true} />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 sm:py-24 bg-slate-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2"
            >
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Stay on Track, Always
                </h2>
                <p className="mt-4 text-lg text-gray-400">
                  Map out your launch with our timeline view, ensuring team
                  alignment.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "Visualize cross-department dependencies.",
                    "Adjust timelines with drag-and-drop.",
                    "Get a bird’s-eye view of your schedule.",
                  ].map((item, index) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 }}
                      className="flex items-start"
                    >
                      <CheckCircle className="h-6 w-6 flex-shrink-0 text-green-400" />
                      <p className="ml-3 text-gray-300">{item}</p>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <Image
                  src="https://placehold.co/800x600/1e293b/94a3b8?text=Gantt+Chart+View"
                  alt="Gantt Chart illustration"
                  className="rounded-md w-full h-auto"
                  width={800}
                  height={600}
                />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 sm:py-24 bg-slate-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Trusted by High-Performance Teams
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="relative max-w-2xl mx-auto"
            >
              <AnimatePresence mode="wait">
                <motion.blockquote
                  key={currentTestimonial}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="bg-slate-800 p-6 rounded-lg shadow-xl"
                >
                  <p className="text-lg text-gray-300">
                    &quot;{testimonials[currentTestimonial].quote}&quot;
                  </p>
                  <footer className="mt-4">
                    <p className="font-semibold text-white">
                      {testimonials[currentTestimonial].author}
                    </p>
                    <p className="text-sm text-gray-400">
                      {testimonials[currentTestimonial].role}
                    </p>
                  </footer>
                </motion.blockquote>
              </AnimatePresence>
              <div className="flex justify-center gap-2 mt-4">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`h-2 w-2 rounded-full ${index === currentTestimonial
                      ? "bg-blue-500"
                      : "bg-gray-500"
                      }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <GanttChartSquare className="h-6 w-6 text-blue-500" />
              <span className="ml-2 text-lg font-semibold">LaunchPad</span>
            </div>
            <p className="mt-4 md:mt-0 text-sm text-gray-400">
              © {new Date().getFullYear()} LaunchPad Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

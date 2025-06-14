"use client";

import React from 'react';
import { ArrowRight, CheckCircle, GanttChartSquare, LayoutDashboard, Layers,LogIn,AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import {signIn } from 'next-auth/react';
// This is a mock signIn function to resolve the build error in this environment.
// In your actual Next.js project, the real import will work correctly.
// const signIn = (provider: string, options: { callbackUrl: string }) => {
//   console.log(`Simulating sign-in with ${provider} and callback to ${options.callbackUrl}`);
//   alert(`In a real app, you would now be redirected to Google to sign in.`);
// };

// This is the dedicated, professional landing page for your application.
export default function LandingPage() {
  return (
    <div className="bg-slate-900 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <GanttChartSquare className="h-8 w-8 text-blue-500" />
              <span className="ml-3 text-2xl font-bold">LaunchPad</span>
            </div>
            <nav className="hidden md:flex md:items-center md:gap-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How It Works</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</a>
            </nav>
            <div className="flex items-center">
              <button
                onClick={() => signIn('google', { callbackUrl: '/' })}
                className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 transition-colors"
              >
                <LogIn size={16} />
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative py-20 sm:py-28 lg:py-32 bg-gradient-to-b from-slate-900 to-slate-800">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
              Coordinate Every Launch, <span className="block text-blue-400">Perfectly on Time.</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-300">
              LaunchPad is the central hub for your product launches. Align your marketing, design, and supply chain teams to ensure every task is completed and every deadline is met.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => signIn('google', { callbackUrl: '/' })}
                className="flex items-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-lg hover:bg-blue-700 transition-transform hover:scale-105"
              >
                Get Started Free <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 sm:py-24 bg-slate-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">All-in-One Launch Management</h2>
              <p className="mt-4 text-lg text-gray-400">Discover the features that make LaunchPad so easy to use.</p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center p-6 bg-slate-900 rounded-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                  <LayoutDashboard className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">Visual Kanban Boards</h3>
                <p className="mt-2 text-base text-gray-400">Track tasks from &quot;To Do&quot; to &quot;Done&quot; with intuitive drag-and-drop boards for every department.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-slate-900 rounded-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">Cross-Department Sync</h3>
                <p className="mt-2 text-base text-gray-400">Ensure Marketing, Design, and Supply teams are always aligned with a single source of truth.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-slate-900 rounded-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">Proactive Delay Alerts</h3>
                <p className="mt-2 text-base text-gray-400">Automatically get notified of overdue tasks and potential delays before they impact your launch date.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works Section */}
        <section id="how-it-works" className="py-20 sm:py-24 bg-slate-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Stay on track, even when the track changes.</h2>
                <p className="mt-4 text-lg text-gray-400">Use the timeline view to map out the big picture, communicate updates to stakeholders, and ensure your team stays on the same page.</p>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 flex-shrink-0 text-green-400" />
                    <p className="ml-3 text-gray-300">Visualize dependencies between different departments.</p>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 flex-shrink-0 text-green-400" />
                    <p className="ml-3 text-gray-300">Easily adjust timelines with drag-and-drop functionality.</p>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 flex-shrink-0 text-green-400" />
                    <p className="ml-3 text-gray-300">Get a bird&#39;s-eye view of your entire launch schedule.</p>
                  </li>
                </ul>
              </div>
                <Image
                  src="https://placehold.co/800x600/1e293b/94a3b8?text=Gantt+Chart+View"
                  alt="Gantt Chart illustration"
                  className="rounded-md w-full h-auto"
                  width={800}
                  height={600}
                />
              </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 sm:py-24 bg-slate-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-bold leading-8 text-white">Trusted by high-performance teams</h2>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <blockquote className="bg-slate-900 p-6 rounded-lg">
                <p className="text-lg text-gray-300">&quot;LaunchPad completely transformed how we manage our seasonal collections. The ability to see everything in one place is a game-changer.&quot;</p>
                <footer className="mt-4">
                  <p className="font-semibold text-white">Priya K.</p>
                  <p className="text-sm text-gray-400">Head of Design</p>
                </footer>
              </blockquote>
              <blockquote className="bg-slate-900 p-6 rounded-lg">
                <p className="text-lg text-gray-300">&quot;Bye-bye, spreadsheets! We&apos;ve eliminated hours of manual status updates. The automated alerts keep everyone accountable.&quot;</p>
                <footer className="mt-4">
                  <p className="font-semibold text-white">Amit S.</p>
                  <p className="text-sm text-gray-400">Finance Lead</p>
                </footer>
              </blockquote>
              <blockquote className="bg-slate-900 p-6 rounded-lg">
                <p className="text-lg text-gray-300">&quot;As a supply chain manager, knowing exactly when marketing needs product for a shoot is critical. LaunchPad connects those dots for us.&quot;</p>
                <footer className="mt-4">
                  <p className="font-semibold text-white">Sunita M.</p>
                  <p className="text-sm text-gray-400">Supply Chain Director</p>
                </footer>
              </blockquote>
            </div>
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
            <p className="mt-4 md:mt-0 text-sm text-gray-400">&copy; {new Date().getFullYear()} LaunchPad Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import React, { useMemo } from "react";
import { Calendar, User, Plus, AlertTriangle, Mail, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

// Import types from your project. If you prefer, create a shared types file.
export type Department = "Marketing" | "Design" | "Finance" | "Supply" | "Merchandise";
export type View = "dashboard" | "create" | "project" | "alerts";
export interface Assignee {
  name: string;
  email: string;
}
export interface Task {
  id: string;
  name: string;
  assignedTo: Assignee;
  timeEstimate: number;
  status: "To Do" | "In Progress" | "Done";
  department: Department;
  dueDate: string;
}
export interface Project {
  id: string;
  name: string;
  launchDate: string;
  tasks: Task[];
}
export interface Alert {
  id: number;
  message: string;
  level: "warning" | "critical";
  taskName: string;
  department: Department;
  recipientEmail: string;
}

interface DashboardViewProps {
  projects: Project[];
  setView: (view: View) => void;
  handleSelectProject: (id: string) => void;
  alerts: Alert[];
  session: import("next-auth").Session | null;
  theme: "dark" | "light";
  toggleTheme: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  setView,
  handleSelectProject,
  alerts,
  session,
  theme,
  toggleTheme,
}) => {
  const projectStats = useMemo(() => {
    return projects.map((p) => {
      const totalTasks = p.tasks.length;
      if (totalTasks === 0)
        return { ...p, progress: 0, taskCount: 0, isAtRisk: false, involvedDepts: [] };
      const doneTasks = p.tasks.filter((t) => t.status === "Done").length;
      const progress = Math.round((doneTasks / totalTasks) * 100);
      const isAtRisk = p.tasks.some(
        (t) => t.status !== "Done" && new Date(t.dueDate) < new Date(new Date().toISOString().split("T")[0])
      );
      const involvedDepts = [...new Set(p.tasks.map((t) => t.department))];
      return { ...p, progress, taskCount: totalTasks, isAtRisk, involvedDepts };
    });
  }, [projects]);

  return (
    <div className="w-full">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Launch Dashboard</h1>
          <p className="text-gray-400">Welcome, {session?.user?.name || "User"}!</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView("alerts")}
            className="relative bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
          >
            <Mail size={20} className="mr-2" /> Alerts
            {alerts.length > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-xs">
                {alerts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setView("create")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
          >
            <Plus size={20} className="mr-2" /> New Launch
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
          >
            <LogOut size={20} className="mr-2" /> Sign Out
          </button>
          <button onClick={toggleTheme} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectStats.map((project) => (
          <div
            key={project.id}
            onClick={() => handleSelectProject(project.id)}
            className={`bg-slate-800 p-6 rounded-xl shadow-lg cursor-pointer hover:bg-slate-700/50 border border-slate-700 transition-all ${project.isAtRisk ? "border-red-500" : "hover:border-blue-500"
              }`}
          >
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-xl mb-3">{project.name}</h3>
              {project.isAtRisk && <AlertTriangle className="text-red-500" />}
            </div>
            <div className="text-sm text-gray-400 mb-4 space-y-2">
              <div className="flex items-center">
                <Calendar size={14} className="mr-2" /> Launch: {project.launchDate}
              </div>
              <div className="flex items-center">
                <User size={14} className="mr-2" /> {project.taskCount} Tasks
              </div>
              <div className="flex items-start">
                <User size={14} className="mr-2 mt-1" />Depts:{" "}
                <span className="flex flex-wrap gap-1 ml-1">
                  {project.involvedDepts.map((d) => (
                    <span key={d} className="text-xs bg-slate-700 px-1.5 py-0.5 rounded">
                      {d}
                    </span>
                  ))}
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5 mb-2">
              <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
            </div>
            <p className="text-right text-sm font-semibold text-gray-300">{project.progress}% Complete</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardView;

"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, DocumentData } from "firebase/firestore";
import { Loader } from "lucide-react";
import Notification from "../components/Notification";
import DashboardView from "../views/DashboardView";
import CreateProjectView from "../views/CreateProjectView";
import ProjectView from "../views/ProjectView";
import AlertsView from "../views/AlertsView";

type Department = "Marketing" | "Design" | "Finance" | "Supply" | "Merchandise";
type View = "dashboard" | "create" | "project" | "alerts";

interface Assignee {
  name: string;
  email: string;
}

interface Task {
  id: string;
  name: string;
  assignedTo: Assignee;
  timeEstimate: number;
  status: "To Do" | "In Progress" | "Done";
  department: Department;
  dueDate: string;
}

interface Project extends DocumentData {
  id: string;
  name: string;
  launchDate: string;
  tasks: Task[];
}

interface Alert {
  id: number;
  message: string;
  level: "warning" | "critical";
  taskName: string;
  department: Department;
  recipientEmail: string;
}

const formatDate = (date: Date) => date.toISOString().split("T")[0];

export default function App() {
  const { data: session, status } = useSession({ required: true });
  const [view, setView] = useState<View>("dashboard");
  const [projects, setProjects] = useState<Project[]>([]);
  const [dataIsLoading, setDataIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  useEffect(() => {
    if (status !== "authenticated") {
      setDataIsLoading(true);
      return;
    }
    const projectsCollection = collection(db, "projects");
    const unsubscribe = onSnapshot(
      projectsCollection,
      (snapshot) => {
        const projectsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Project[];
        setProjects(projectsData);
        setDataIsLoading(false);
      },
      (error) => {
        console.error("Error fetching projects: ", error);
        setNotification({ message: "Could not load projects.", type: "error" });
        setDataIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [status]);

  useEffect(() => {
    if (selectedProject) {
      const updated = projects.find((p) => p.id === selectedProject.id);
      if (updated) setSelectedProject(updated);
    }
  }, [projects, selectedProject]);

  useEffect(() => {
    if (dataIsLoading) return;
    const generatedAlerts: Alert[] = [];
    const todayStr = formatDate(new Date());
    projects.forEach((p) => {
      p.tasks.forEach((t) => {
        if (t.status !== "Done" && t.dueDate < todayStr) {
          const message = `Task "${t.name}" in the ${t.department} department is overdue. Please follow up with ${t.assignedTo.name}.`;
          generatedAlerts.push({
            id: Math.random(),
            message,
            level: "warning",
            taskName: t.name,
            department: t.department,
            recipientEmail: t.assignedTo.email,
          });
        }
      });
    });
    setAlerts(generatedAlerts);
  }, [projects, dataIsLoading]);

  const handleSelectProject = (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (proj) {
      setSelectedProject(proj);
      setView("project");
    }
  };

  if (status === "loading" || dataIsLoading) {
    return (
      <main className="min-h-screen w-full bg-slate-900 text-white flex items-center justify-center">
        <Loader className="animate-spin" size={48} />
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen w-full ${theme === "dark" ? "bg-slate-900 text-white" : "bg-gray-100 text-black"
        } flex items-center justify-center p-4 sm:p-8`}
    >
      <Notification
        message={notification?.message || ""}
        onClose={() => setNotification(null)}
        type={notification?.type || "error"}
      />
      {view === "dashboard" && (
        <DashboardView
          projects={projects}
          setView={setView}
          handleSelectProject={handleSelectProject}
          alerts={alerts}
          session={session}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}
      {view === "create" && (
        <CreateProjectView setView={setView} setNotification={setNotification} />
      )}
      {view === "project" &&
        selectedProject && (
          <ProjectView
            project={selectedProject}
            setView={setView}
            setNotification={setNotification}
          />
        )}
      {view === "alerts" && (
        <AlertsView alerts={alerts} setView={setView} setNotification={setNotification} />
      )}
    </main>
  );
}

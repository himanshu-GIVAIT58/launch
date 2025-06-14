"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, doc, DocumentData } from 'firebase/firestore';
import { Plus, Calendar, Clock, User, ArrowLeft, GripVertical, CheckCircle, Circle, MoreHorizontal, X, AlertTriangle, Mail, LogOut, Loader, AtSign } from 'lucide-react';

// --- TYPE DEFINITIONS ---
type Department = "Marketing" | "Design" | "Finance" | "Supply" | "Merchandise";
type View = 'dashboard' | 'create' | 'project' | 'alerts';

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
  level: 'warning' | 'critical';
  taskName: string;
  department: Department;
  recipientEmail: string;
}

// --- CONFIG ---
const DEPARTMENTS: Department[] = ["Marketing", "Design", "Finance", "Supply", "Merchandise"];
const formatDate = (date: Date) => date.toISOString().split('T')[0];

// --- UI COMPONENTS ---
const Notification = ({ message, onClose, type = 'error' }: { message: string, onClose: () => void, type?: 'error' | 'success' }) => {
  if (!message) return null;
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);
  const bgColor = type === 'error' ? 'bg-red-600' : 'bg-green-600';
  return (
    <div className={`fixed top-5 right-5 ${bgColor} text-white py-2 px-4 rounded-lg shadow-lg z-50 flex items-center`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-3 text-white"><X size={18} /></button>
    </div>
  );
};

const InputField = ({ icon, ...props }: { icon: React.ReactNode; [key: string]: any }) => (
  <div className="relative flex items-center">
    <span className="absolute left-3 text-gray-400">{icon}</span>
    <input {...props} className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
  </div>
);

const SelectField = ({ icon, children, ...props }: { icon: React.ReactNode; children: React.ReactNode; [key: string]: any }) => (
  <div className="relative flex items-center">
    <span className="absolute left-3 text-gray-400">{icon}</span>
    <select {...props} className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
      {children}
    </select>
  </div>
);

const TaskCard = ({ task, onDragStart, isOverdue }: { task: Task, onDragStart: (e: React.DragEvent, taskId: string) => void, isOverdue: boolean }) => {
  const deptColors: Record<Department, string> = { Design: "bg-purple-500", Marketing: "bg-blue-500", Finance: "bg-green-500", Supply: "bg-orange-500", Merchandise: "bg-pink-500" };
  return (
    <div draggable onDragStart={(e) => onDragStart(e, task.id)} className={`bg-slate-800 p-4 rounded-lg shadow-lg mb-4 cursor-grab active:cursor-grabbing border-l-4 ${isOverdue && task.status !== 'Done' ? 'border-red-500' : 'border-slate-700'} hover:border-blue-500 transition-all duration-200`}>
      <div className="flex justify-between items-start">
        <p className="font-bold text-gray-100 break-words w-11/12">{task.name}</p>
        <GripVertical className="text-gray-500 w-1/12" />
      </div>
      <div className="flex items-center justify-between mt-3 text-sm text-gray-400">
        <div className="flex items-center">
          <User size={14} className="mr-1.5" />
          <span>{task.assignedTo.name}</span>
        </div>
        <div className="flex items-center">
          <Clock size={14} className="mr-1.5" />
          <span>{task.timeEstimate} hrs</span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${deptColors[task.department]}`}>{task.department}</div>
        {isOverdue && task.status !== 'Done' && <AlertTriangle size={16} className="text-red-500" />}
      </div>
    </div>
  );
};

const KanbanColumn = ({ status, tasks, onDrop, onDragOver }: { status: Task['status'], tasks: Task[], onDrop: (e: React.DragEvent, status: Task['status']) => void, onDragOver: (e: React.DragEvent) => void }) => {
  const statusConfig = { 
    'To Do': { icon: <Circle className="text-yellow-400" />, color: 'border-yellow-400' }, 
    'In Progress': { icon: <MoreHorizontal className="text-blue-400" />, color: 'border-blue-400' }, 
    'Done': { icon: <CheckCircle className="text-green-400" />, color: 'border-green-400' } 
  };
  const config = statusConfig[status];
  return (
    <div className="bg-slate-900 rounded-xl p-4 flex-1 min-h-[60vh]" onDrop={(e) => onDrop(e, status)} onDragOver={onDragOver}>
      <div className={`flex items-center mb-4 pb-2 border-b-2 ${config.color}`}>
        {config.icon} 
        <h3 className="font-bold text-lg ml-2 text-white">{status}</h3>
        <span className="ml-2 bg-slate-700 text-gray-300 text-sm font-semibold rounded-full px-2 py-0.5">{tasks.length}</span>
      </div>
      <div className="h-full">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onDragStart={(e, taskId) => { e.dataTransfer.setData("taskId", String(taskId)); }} isOverdue={new Date(task.dueDate) < new Date(formatDate(new Date()))} />
        ))}
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const { data: session, status } = useSession({ required: true });
  const [view, setView] = useState<View>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [dataIsLoading, setDataIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'error' | 'success' } | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // --- THEME STATE ---
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const toggleTheme = () => setTheme(prev => prev === "dark" ? "light" : "dark");

  useEffect(() => {
    if (status !== 'authenticated') return;
    const projectsCollection = collection(db, 'projects');
    const unsubscribe = onSnapshot(projectsCollection, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      setProjects(projectsData);
      setDataIsLoading(false);
    }, (error) => {
      console.error("Error fetching projects: ", error);
      setNotification({ message: "Could not load projects.", type: "error" });
      setDataIsLoading(false);
    });
    return () => unsubscribe();
  }, [status]);

  // Update selected project in real time if it is open.
  useEffect(() => {
    if (selectedProject) {
      const updated = projects.find(p => p.id === selectedProject.id);
      if (updated) setSelectedProject(updated);
    }
  }, [projects, selectedProject]);

  // --- ALERT GENERATION LOGIC ---
  useEffect(() => {
    if (dataIsLoading) return;
    const generatedAlerts: Alert[] = [];
    const todayStr = formatDate(new Date());
    projects.forEach(p => {
      p.tasks.forEach(t => {
        if (t.status !== 'Done' && t.dueDate < todayStr) {
          const message = `Task "${t.name}" in the ${t.department} department is overdue. Please follow up with ${t.assignedTo.name}.`;
          generatedAlerts.push({ id: Math.random(), message, level: 'warning', taskName: t.name, department: t.department, recipientEmail: t.assignedTo.email });
        }
      });
    });
    setAlerts(generatedAlerts);
  }, [projects, dataIsLoading]);

  const handleSelectProject = (projectId: string) => {
    const proj = projects.find(p => p.id === projectId);
    if (proj) {
      setSelectedProject(proj);
      setView('project');
    }
  };

  if (status === 'loading' || dataIsLoading) {
    return (
      <main className="min-h-screen w-full bg-slate-900 text-white flex items-center justify-center">
        <Loader className="animate-spin" size={48} />
      </main>
    );
  }

  return (
    <main className={`min-h-screen w-full ${theme === "dark" ? "bg-slate-900 text-white" : "bg-gray-100 text-black"} flex items-center justify-center p-4 sm:p-8`}>
      <Notification message={notification?.message || ""} onClose={() => setNotification(null)} type={notification?.type || 'error'} />
      {view === 'dashboard' &&
        <DashboardView 
          projects={projects} 
          setView={setView} 
          handleSelectProject={handleSelectProject} 
          alerts={alerts} 
          session={session}
          theme={theme}
          toggleTheme={toggleTheme}
        />}
      {view === 'create' && <CreateProjectView setView={setView} setNotification={setNotification} />}
      {view === 'project' && selectedProject && <ProjectView project={selectedProject} setView={setView} setNotification={setNotification} />}
      {view === 'alerts' && <AlertsView alerts={alerts} setView={setView} setNotification={setNotification} />}
    </main>
  );
}

// --- VIEW COMPONENTS ---
interface DashboardViewProps { 
  projects: Project[];
  setView: (view: View) => void;
  handleSelectProject: (id: string) => void;
  alerts: Alert[];
  session: any;
  theme: "dark" | "light";
  toggleTheme: () => void;
}
const DashboardView = ({ projects, setView, handleSelectProject, alerts, session, theme, toggleTheme }: DashboardViewProps) => {
  const projectStats = useMemo(() => {
    return projects.map(p => {
      const totalTasks = p.tasks.length;
      if (totalTasks === 0) return { ...p, progress: 0, taskCount: 0, isAtRisk: false, involvedDepts: [] };
      const doneTasks = p.tasks.filter(t => t.status === 'Done').length;
      const progress = Math.round((doneTasks / totalTasks) * 100);
      const isAtRisk = p.tasks.some(t => t.status !== 'Done' && new Date(t.dueDate) < new Date(formatDate(new Date())));
      const involvedDepts = [...new Set(p.tasks.map(t => t.department))];
      return { ...p, progress, taskCount: totalTasks, isAtRisk, involvedDepts };
    });
  }, [projects]);

  return (
    <div className="w-full">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Launch Dashboard</h1>
          <p className="text-gray-400">Welcome, {session?.user?.name || 'User'}!</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setView('alerts')} className="relative bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
            <Mail size={20} className="mr-2" /> Alerts
            {alerts.length > 0 && <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-xs">{alerts.length}</span>}
          </button>
          <button onClick={() => setView('create')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
            <Plus size={20} className="mr-2" /> New Launch
          </button>
          <button onClick={() => signOut({ callbackUrl: '/auth/signin' })} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
            <LogOut size={20} className="mr-2" /> Sign Out
          </button>
          <button onClick={toggleTheme} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectStats.map(project => (
          <div 
            key={project.id} 
            onClick={() => handleSelectProject(project.id)} 
            className={`bg-slate-800 p-6 rounded-xl shadow-lg cursor-pointer hover:bg-slate-700/50 border border-slate-700 transition-all ${project.isAtRisk ? 'border-red-500' : 'hover:border-blue-500'}`}
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
                <User size={14} className="mr-2 mt-1" />Depts: 
                <span className="flex flex-wrap gap-1 ml-1">
                  {project.involvedDepts.map(d => <span key={d} className="text-xs bg-slate-700 px-1.5 py-0.5 rounded">{d}</span>)}
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

const CreateProjectView = ({ setView, setNotification }: { setView: (view: View) => void, setNotification: (notification: any) => void }) => {
  const [createStep, setCreateStep] = useState(1);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectLaunchDate, setNewProjectLaunchDate] = useState("");
  const [newProjectTasks, setNewProjectTasks] = useState<Omit<Task, 'id'>[]>([]);
  const [taskName, setTaskName] = useState("");
  const [assignedToName, setAssignedToName] = useState("");
  const [assignedToEmail, setAssignedToEmail] = useState("");
  const [timeEstimate, setTimeEstimate] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskDepartment, setTaskDepartment] = useState<Department>(DEPARTMENTS[0]);

  const handleAddTask = () => {
    if (!taskName || !assignedToName || !assignedToEmail || !timeEstimate || !taskDueDate) {
      setNotification({ message: "Please fill all task fields.", type: 'error' });
      return;
    }
    const newTask = { name: taskName, assignedTo: { name: assignedToName, email: assignedToEmail }, timeEstimate: parseInt(timeEstimate, 10), status: "To Do" as const, department: taskDepartment, dueDate: taskDueDate };
    setNewProjectTasks([...newProjectTasks, newTask]);
    setTaskName(""); setAssignedToName(""); setAssignedToEmail(""); setTimeEstimate(""); setTaskDueDate("");
  };

  const handleCreateProject = async () => {
    if (!newProjectName || !newProjectLaunchDate) {
      setNotification({ message: "Please fill project name and launch date.", type: 'error' });
      return;
    }
    const tasksWithIds = newProjectTasks.map(task => ({ ...task, id: Math.random().toString(36).substr(2, 9) }));
    try {
      await addDoc(collection(db, 'projects'), { name: newProjectName, launchDate: newProjectLaunchDate, tasks: tasksWithIds });
      setNotification({ message: "Project created successfully!", type: "success" });
      setView('dashboard');
    } catch (error) {
      console.error("Error creating project: ", error);
      setNotification({ message: "Failed to create project.", type: "error" });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <button onClick={() => setView('dashboard')} className="flex items-center text-blue-400 hover:text-blue-300 mb-8">
        <ArrowLeft size={18} className="mr-2" /> Back
      </button>
      <div className="bg-slate-800 rounded-xl shadow-2xl p-8">
        {createStep === 1 ? (
          <div>
            <h2 className="text-2xl font-bold mb-6">Create New Launch Project</h2>
            <div className="space-y-4">
              <InputField icon={<User />} type="text" placeholder="Launch Name" value={newProjectName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProjectName(e.target.value)} />
              <InputField icon={<Calendar />} type="date" value={newProjectLaunchDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProjectLaunchDate(e.target.value)} />
            </div>
            <button onClick={() => setCreateStep(2)} disabled={!newProjectName || !newProjectLaunchDate} className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg disabled:bg-gray-500">
              Next: Add Tasks
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-2">Add Tasks for &quot;{newProjectName}&quot;</h2>
            <div className="bg-slate-700 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InputField icon={<User />} type="text" placeholder="Task Name" value={taskName} onChange={(e) => setTaskName(e.target.value)} />
                <SelectField icon={<User />} value={taskDepartment} onChange={(e) => setTaskDepartment(e.target.value as Department)}>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </SelectField>
                <InputField icon={<Clock />} type="number" placeholder="Time Estimate (hrs)" value={timeEstimate} onChange={(e) => setTimeEstimate(e.target.value)} />
                <InputField icon={<Calendar />} type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} />
                <InputField icon={<User />} type="text" placeholder="Assignee Name" value={assignedToName} onChange={(e) => setAssignedToName(e.target.value)} />
                <InputField icon={<AtSign />} type="email" placeholder="Assignee Email" value={assignedToEmail} onChange={(e) => setAssignedToEmail(e.target.value)} />
              </div>
              <button onClick={handleAddTask} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                <Plus size={16} className="mr-2" />Add Task
              </button>
            </div>
            <h3 className="font-semibold text-lg mb-4">Tasks Added ({newProjectTasks.length})</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {newProjectTasks.map((task, index) => (
                <div key={index} className="bg-slate-700 p-3 rounded-lg flex justify-between items-center">
                  <span>{task.name} ({task.department})</span>
                  <span className="text-gray-400 text-sm">{task.assignedTo.name} / {task.assignedTo.email}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-8">
              <button onClick={() => setCreateStep(1)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg">Back</button>
              <button onClick={handleCreateProject} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg">Create Project</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectView = ({ project, setView, setNotification }: { project: Project, setView: (view: View) => void, setNotification: (notification: any) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  // Local state for editing project details
  const [editProjectName, setEditProjectName] = useState(project.name);
  const [editLaunchDate, setEditLaunchDate] = useState(project.launchDate);
  const [editedTasks, setEditedTasks] = useState(project.tasks);

  // Handler for updating individual task fields during edit
  const handleTaskChange = (index: number, field: "name" | "timeEstimate", value: string) => {
    const newTasks = [...editedTasks];
    newTasks[index] = { 
      ...newTasks[index], 
      [field]: field === "timeEstimate" ? parseInt(value, 10) : value 
    };
    setEditedTasks(newTasks);
  };

  // Save edited changes to Firestore
  const saveEdits = async () => {
    const projectRef = doc(db, 'projects', project.id);
    try {
      await updateDoc(projectRef, { 
        name: editProjectName,
        launchDate: editLaunchDate,
        tasks: editedTasks,
      });
      setNotification({ message: "Project updated successfully!", type: "success" });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating project: ", error);
      setNotification({ message: "Failed to update project.", type: "error" });
    }
  };

  // Drag-and-drop handler for non-editing mode
  const onDrop = async (e: React.DragEvent, newStatus: Task['status']) => {
    const taskId = e.dataTransfer.getData("taskId");
    const updatedTasks = project.tasks.map(t =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    const projectRef = doc(db, 'projects', project.id);
    try {
      await updateDoc(projectRef, { tasks: updatedTasks });
    } catch (error) {
      console.error("Error updating task status: ", error);
      setNotification({ message: "Failed to update task.", type: "error" });
    }
  };

  return (
    <div className="w-full">
      <button onClick={() => setView('dashboard')} className="flex items-center text-blue-400 hover:text-blue-300 mb-4">
        <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
      </button>
      {isEditing ? (
        <div className="bg-slate-800 rounded-xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold mb-6">Edit Project</h1>
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Project Name:</label>
            <input 
              type="text"
              value={editProjectName}
              onChange={(e) => setEditProjectName(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-2 px-3"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-semibold">Launch Date:</label>
            <input 
              type="date"
              value={editLaunchDate}
              onChange={(e) => setEditLaunchDate(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-2 px-3"
            />
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Edit Tasks</h2>
            {editedTasks.map((task, index) => (
              <div key={task.id} className="mb-4 p-4 bg-gray-800 rounded-lg">
                <div className="mb-2">
                  <label className="block mb-1 font-semibold">Task Name:</label>
                  <input
                    type="text"
                    value={task.name}
                    onChange={(e) => handleTaskChange(index, "name", e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-2 px-3"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Time Estimate (hrs):</label>
                  <input
                    type="number"
                    value={task.timeEstimate}
                    onChange={(e) => handleTaskChange(index, "timeEstimate", e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-2 px-3"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4">
            <button 
              onClick={saveEdits} 
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Save Changes
            </button>
            <button 
              onClick={() => setIsEditing(false)} 
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-4xl font-bold">{project.name}</h1>
            <div className="flex items-center text-gray-400 mt-2">
              <Calendar size={16} className="mr-2" /> Launch Date: {project.launchDate}
            </div>
          </div>
          <div className="flex gap-4 mb-4">
            <button 
              onClick={() => setIsEditing(true)} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Edit Project
            </button>
          </div>
          <div className="flex flex-col lg:flex-row gap-6">
            <KanbanColumn status="To Do" tasks={project.tasks.filter(t => t.status === 'To Do')} onDrop={onDrop} onDragOver={(e) => e.preventDefault()} />
            <KanbanColumn status="In Progress" tasks={project.tasks.filter(t => t.status === 'In Progress')} onDrop={onDrop} onDragOver={(e) => e.preventDefault()} />
            <KanbanColumn status="Done" tasks={project.tasks.filter(t => t.status === 'Done')} onDrop={onDrop} onDragOver={(e) => e.preventDefault()} />
          </div>
        </>
      )}
    </div>
  );
};

const AlertsView = ({ alerts, setView, setNotification }: { alerts: Alert[], setView: (view: View) => void, setNotification: (notification: any) => void }) => {
  const handleSendAlertEmail = async (alert: Alert) => {
    setNotification({ message: `Notifying ${alert.recipientEmail}...`, type: 'success' });
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: alert.recipientEmail,
          subject: `[DELAY] Task Overdue: ${alert.taskName}`,
          message: `This is an automated notification from LaunchPad. The following task is overdue: <strong>${alert.taskName}</strong> assigned to the <strong>${alert.department}</strong> department. This may affect the project timeline.`
        }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message || 'Unknown error');
      setNotification({ message: 'Notification sent!', type: 'success' });
    } catch (error) {
      console.error(error);
      setNotification({ message: 'Failed to send notification.', type: 'error' });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <button onClick={() => setView('dashboard')} className="flex items-center text-blue-400 hover:text-blue-300 mb-8">
        <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
      </button>
      <h1 className="text-3xl font-bold mb-6">System Alerts</h1>
      <div className="space-y-4">
        {alerts.length > 0 ? alerts.map(alert => (
          <div key={alert.id} className="p-4 rounded-lg border-l-4 bg-yellow-900/50 border-yellow-500">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <AlertTriangle className="mr-4 mt-1 flex-shrink-0 text-yellow-400" size={24} />
                <p className="text-white">{alert.message}</p>
              </div>
              <button onClick={() => handleSendAlertEmail(alert)} className="ml-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-1 px-3 rounded-lg flex items-center gap-2">
                <Mail size={14} /> Notify
              </button>
            </div>
          </div>
        )) : <p className="text-gray-400">No active alerts. All projects are on track!</p>}
      </div>
    </div>
  );
};

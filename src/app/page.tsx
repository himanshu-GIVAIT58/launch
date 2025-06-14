"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Plus, Calendar, Clock, User, ArrowLeft, GripVertical, CheckCircle, Circle, MoreHorizontal, X, AlertTriangle, Mail, LogOut, Loader } from 'lucide-react';

// --- TYPE DEFINITIONS for TypeScript ---
type Department = "Marketing" | "Design" | "Finance" | "Supply" | "Merchandise";

interface Task {
  id: number;
  name: string;
  assignedTo: string;
  timeEstimate: number; // in hours
  status: "To Do" | "In Progress" | "Done";
  department: Department;
  dueDate: string; // YYYY-MM-DD
}

interface Project {
  id: number;
  name: string;
  launchDate: string; // YYYY-MM-DD
  tasks: Task[];
}

interface Alert {
  id: number;
  message: string;
  level: 'warning' | 'critical';
  projectId: number;
  taskId: number;
  taskName: string;
  department: Department;
}

// --- MOCK DATA & CONFIG ---
const DEPARTMENTS: Department[] = ["Marketing", "Design", "Finance", "Supply", "Merchandise"];
const formatDate = (date: Date) => date.toISOString().split('T')[0];

const initialProjects: Project[] = [
  {
    id: 1,
    name: "Rakhi Collection Launch 2025",
    launchDate: "2025-08-19",
    tasks: [
      { id: 101, name: "Finalize Collection Designs", assignedTo: "Priya", timeEstimate: 80, status: "Done", department: "Design", dueDate: "2025-06-10" },
      { id: 102, name: "Approve Production Budget", assignedTo: "Amit", timeEstimate: 16, status: "Done", department: "Finance", dueDate: "2025-06-15" },
      { id: 103, name: "Place Order with Vendor", assignedTo: "Sunita", timeEstimate: 24, status: "In Progress", department: "Supply", dueDate: "2025-06-25" },
      { id: 104, name: "Plan Photoshoot & Video Content", assignedTo: "Rohan", timeEstimate: 40, status: "In Progress", department: "Marketing", dueDate: "2025-07-10" },
      { id: 105, name: "Receive Goods at Warehouse", assignedTo: "Sunita", timeEstimate: 30, status: "To Do", department: "Supply", dueDate: "2025-07-20" },
      { id: 106, name: "Quality Check of Inventory", assignedTo: "Sunita", timeEstimate: 40, status: "To Do", department: "Supply", dueDate: "2025-07-25" },
      { id: 107, name: "Execute Photoshoot", assignedTo: "Rohan", timeEstimate: 50, status: "To Do", department: "Marketing", dueDate: "2025-07-30" },
      { id: 108, name: "Dispatch to Retail Stores", assignedTo: "Vijay", timeEstimate: 60, status: "To Do", department: "Merchandise", dueDate: "2025-08-10" },
      { id: 109, name: "Launch Social Media Campaign", assignedTo: "Rohan", timeEstimate: 40, status: "To Do", department: "Marketing", dueDate: "2025-08-15" },
    ]
  },
];

// --- UI COMPONENTS (TaskCard, KanbanColumn etc. remain the same) ---
const Notification = ({ message, onClose, type = 'error' }: { message: string, onClose: () => void, type?: 'error' | 'success' }) => {
  if (!message) return null;
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);
  const bgColor = type === 'error' ? 'bg-red-600' : 'bg-green-600';
  return (
    <div className={`fixed top-5 right-5 ${bgColor} text-white py-2 px-4 rounded-lg shadow-lg z-50 flex items-center animate-fade-in-down`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-3 text-white"><X size={18} /></button>
    </div>
  );
};
const InputField = ({ icon, ...props }: { icon: React.ReactNode;[key: string]: any }) => (<div className="relative flex items-center"> <span className="absolute left-3 text-gray-400">{icon}</span> <input {...props} className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500" /> </div>);
const SelectField = ({ icon, children, ...props }: { icon: React.ReactNode; children: React.ReactNode;[key: string]: any }) => (<div className="relative flex items-center"> <span className="absolute left-3 text-gray-400">{icon}</span> <select {...props} className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"> {children} </select> </div>);
const TaskCard = ({ task, onDragStart, isOverdue }: { task: Task, onDragStart: (e: React.DragEvent, taskId: number) => void, isOverdue: boolean }) => { const deptColors: Record<Department, string> = { Design: "bg-purple-500", Marketing: "bg-blue-500", Finance: "bg-green-500", Supply: "bg-orange-500", Merchandise: "bg-pink-500" }; return (<div draggable onDragStart={(e) => onDragStart(e, task.id)} className={`bg-slate-800 p-4 rounded-lg shadow-lg mb-4 cursor-grab active:cursor-grabbing border-l-4 ${isOverdue && task.status !== 'Done' ? 'border-red-500' : 'border-slate-700'} hover:border-blue-500 transition-all duration-200`}> <div className="flex justify-between items-start"> <p className="font-bold text-gray-100 break-words w-11/12">{task.name}</p> <GripVertical className="text-gray-500 w-1/12" /> </div> <div className="flex items-center justify-between mt-3 text-sm text-gray-400"> <div className="flex items-center"> <User size={14} className="mr-1.5" /> <span>{task.assignedTo}</span> </div> <div className="flex items-center"> <Clock size={14} className="mr-1.5" /> <span>{task.timeEstimate} hrs</span> </div> </div> <div className="flex items-center justify-between mt-3"> <div className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${deptColors[task.department]}`}>{task.department}</div> {isOverdue && task.status !== 'Done' && <AlertTriangle size={16} className="text-red-500" />} </div> </div>); };
const KanbanColumn = ({ status, tasks, onDrop, onDragOver }: { status: Task['status'], tasks: Task[], onDrop: (e: React.DragEvent, status: Task['status']) => void, onDragOver: (e: React.DragEvent) => void }) => { const statusConfig = { 'To Do': { icon: <Circle className="text-yellow-400" />, color: 'border-yellow-400' }, 'In Progress': { icon: <MoreHorizontal className="text-blue-400" />, color: 'border-blue-400' }, 'Done': { icon: <CheckCircle className="text-green-400" />, color: 'border-green-400' } }; const config = statusConfig[status]; return (<div className="bg-slate-900 rounded-xl p-4 flex-1 min-h-[60vh]" onDrop={(e) => onDrop(e, status)} onDragOver={onDragOver} > <div className={`flex items-center mb-4 pb-2 border-b-2 ${config.color}`}> {config.icon} <h3 className="font-bold text-lg ml-2 text-white">{status}</h3> <span className="ml-2 bg-slate-700 text-gray-300 text-sm font-semibold rounded-full px-2 py-0.5">{tasks.length}</span> </div> <div className="h-full"> {tasks.map(task => (<TaskCard key={task.id} task={task} onDragStart={(e, taskId) => { e.dataTransfer.setData("taskId", String(taskId)); }} isOverdue={new Date(task.dueDate) < new Date(formatDate(new Date()))} />))} </div> </div>); };


// --- MAIN APP COMPONENT ---
export default function App() {
  const { data: session, status } = useSession();
  const [view, setView] = useState<'dashboard' | 'create' | 'project' | 'alerts'>('dashboard');
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'error' | 'success' } | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // --- Create Project Logic (remains the same) ---
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectLaunchDate, setNewProjectLaunchDate] = useState("");
  const [newProjectTasks, setNewProjectTasks] = useState<Task[]>([]);
  const [taskName, setTaskName] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [timeEstimate, setTimeEstimate] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskDepartment, setTaskDepartment] = useState<Department>(DEPARTMENTS[0]);
  const [createStep, setCreateStep] = useState(1);

  // --- Alert Generation Logic ---
  useEffect(() => {
    const generatedAlerts: Alert[] = [];
    const todayStr = formatDate(new Date());
    projects.forEach(p => {
      p.tasks.forEach(t => {
        if (t.status !== 'Done' && t.dueDate < todayStr) {
          const message = `Task "${t.name}" (${t.department}) is overdue. This may impact project timelines.`;
          generatedAlerts.push({ id: Math.random(), message, level: 'warning', projectId: p.id, taskId: t.id, taskName: t.name, department: t.department });
        }
      });
    });
    setAlerts(generatedAlerts);
  }, [projects]);

  // --- Email Sending Logic ---
  const handleSendAlertEmail = async (alert: Alert) => {
    setNotification({ message: 'Sending notification...', type: 'success' });
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'team.lead@example.com', // In a real app, get this from user data or department settings
          subject: `[DELAY] Task Overdue: ${alert.taskName}`,
          message: `This is an automated notification. The following task is overdue: <strong>${alert.taskName}</strong> assigned to the <strong>${alert.department}</strong> department. This may affect the project timeline.`
        }),
      });
      const result = await response.json();
      if (result.success) {
        setNotification({ message: 'Notification sent!', type: 'success' });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error(error);
      setNotification({ message: 'Failed to send notification.', type: 'error' });
    }
  };

  // --- Core Logic (Create project, add task, drag-drop - remain mostly the same)
  const handleAddTask = () => { if (!taskName || !assignedTo || !timeEstimate || !taskDueDate) { setNotification({ message: "Please fill all task fields.", type: 'error' }); return; } const newTask: Task = { id: Date.now(), name: taskName, assignedTo, timeEstimate: parseInt(timeEstimate, 10), status: "To Do", department: taskDepartment, dueDate: taskDueDate, }; setNewProjectTasks([...newProjectTasks, newTask]); setTaskName(""); setAssignedTo(""); setTimeEstimate(""); setTaskDueDate(""); };
  const handleCreateProject = () => { if (!newProjectName || !newProjectLaunchDate) { setNotification({ message: "Please fill project name and launch date.", type: 'error' }); return; } const newProject: Project = { id: Date.now(), name: newProjectName, launchDate: newProjectLaunchDate, tasks: newProjectTasks }; setProjects([newProject, ...projects]); setNewProjectName(""); setNewProjectLaunchDate(""); setNewProjectTasks([]); setCreateStep(1); setView('dashboard'); };
  const handleSelectProject = (project: Project) => { setSelectedProject(project); setView('project'); };
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const onDrop = (e: React.DragEvent, newStatus: Task['status']) => { const taskId = parseInt(e.dataTransfer.getData("taskId"), 10); const updatedProjects = projects.map(p => { if (p.id === selectedProject?.id) { const updatedTasks = p.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t); return { ...p, tasks: updatedTasks }; } return p; }); setProjects(updatedProjects); const updatedSelectedProject = updatedProjects.find(p => p.id === selectedProject?.id); if (updatedSelectedProject) setSelectedProject(updatedSelectedProject); };
  const projectStats = useMemo(() => { return projects.map(p => { const totalTasks = p.tasks.length; if (totalTasks === 0) return { ...p, progress: 0, taskCount: 0, isAtRisk: false, involvedDepts: [] }; const doneTasks = p.tasks.filter(t => t.status === 'Done').length; const progress = Math.round((doneTasks / totalTasks) * 100); const isAtRisk = p.tasks.some(t => t.status !== 'Done' && new Date(t.dueDate) < new Date(formatDate(new Date()))); const involvedDepts = [...new Set(p.tasks.map(t => t.department))]; return { ...p, progress, taskCount: totalTasks, isAtRisk, involvedDepts }; }); }, [projects]);

  // --- RENDER LOGIC based on Auth Status ---
  if (status === 'loading') {
    return (
      <div className="min-h-screen w-full bg-slate-900 text-white flex items-center justify-center">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <main className="min-h-screen w-full bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-5xl font-bold mb-2">LaunchPad</h1>
          <p className="text-gray-400 mb-8">Sign in to manage your launches</p>
          <button onClick={() => signIn('google')} className="w-full bg-white text-gray-800 font-bold py-3 rounded-lg flex items-center justify-center gap-3 transition-transform hover:scale-105 shadow-lg">
            <svg className="w-6 h-6" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
            Sign in with Google
          </button>
        </div>
      </main>
    )
  }

  // --- AUTHENTICATED VIEW ---
  const renderContent = () => {
    // RENDER LOGIC for each view
    switch (view) {
      case 'create': return (<div className="w-full max-w-4xl mx-auto"> <button onClick={() => setView('dashboard')} className="flex items-center text-blue-400 hover:text-blue-300 mb-8"><ArrowLeft size={18} className="mr-2" /> Back to Dashboard</button> <div className="bg-slate-800 rounded-xl shadow-2xl p-8"> {createStep === 1 ? (<div> <h2 className="text-2xl font-bold mb-6">Create New Launch Project</h2> <div className="space-y-4"> <InputField icon={<User />} type="text" placeholder="Launch Name (e.g., Diwali Collection)" value={newProjectName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProjectName(e.target.value)} /> <InputField icon={<Calendar />} type="date" value={newProjectLaunchDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProjectLaunchDate(e.target.value)} /> </div> <button onClick={() => setCreateStep(2)} disabled={!newProjectName || !newProjectLaunchDate} className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed">Next: Add Tasks</button> </div>) : (<div> <h2 className="text-2xl font-bold mb-2">Add Tasks for "{newProjectName}"</h2> <div className="bg-slate-700 p-4 rounded-lg mb-6"> <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> <InputField icon={<User />} type="text" placeholder="Task Name" value={taskName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTaskName(e.target.value)} /> <InputField icon={<User />} type="text" placeholder="Assigned To (Lead)" value={assignedTo} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAssignedTo(e.target.value)} /> <InputField icon={<Clock />} type="number" placeholder="Time Estimate (hrs)" value={timeEstimate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTimeEstimate(e.target.value)} /> <InputField icon={<Calendar />} type="date" value={taskDueDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTaskDueDate(e.target.value)} /> <SelectField icon={<User />} value={taskDepartment} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTaskDepartment(e.target.value as Department)}> {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)} </SelectField> </div> <button onClick={handleAddTask} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"><Plus size={16} className="mr-2" />Add Task</button> </div> <h3 className="font-semibold text-lg mb-4">Tasks Added ({newProjectTasks.length})</h3> <div className="space-y-3 max-h-48 overflow-y-auto pr-2"> {newProjectTasks.map(task => (<div key={task.id} className="bg-slate-700 p-3 rounded-lg flex justify-between items-center"> <span>{task.name} ({task.department})</span> <span className="text-gray-400 text-sm">{task.assignedTo} / {task.dueDate}</span> </div>))} </div> <div className="flex justify-between mt-8"> <button onClick={() => setCreateStep(1)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg">Back</button> <button onClick={handleCreateProject} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg">Create Project</button> </div> </div>)} </div> </div>);
      case 'project': if (!selectedProject) return null; const { tasks } = selectedProject; return (<div className="w-full"> <button onClick={() => setView('dashboard')} className="flex items-center text-blue-400 hover:text-blue-300 mb-4"><ArrowLeft size={18} className="mr-2" /> Back to Dashboard</button> <div className="mb-8"> <h1 className="text-4xl font-bold">{selectedProject.name}</h1> <div className="flex items-center text-gray-400 mt-2"><Calendar size={16} className="mr-2" />Launch Date: {selectedProject.launchDate}</div> </div> <div className="flex flex-col lg:flex-row gap-6"> <KanbanColumn status="To Do" tasks={tasks.filter(t => t.status === 'To Do')} onDrop={onDrop} onDragOver={onDragOver} /> <KanbanColumn status="In Progress" tasks={tasks.filter(t => t.status === 'In Progress')} onDrop={onDrop} onDragOver={onDragOver} /> <KanbanColumn status="Done" tasks={tasks.filter(t => t.status === 'Done')} onDrop={onDrop} onDragOver={onDragOver} /> </div> </div>);
      case 'alerts': return (<div className="w-full max-w-4xl mx-auto"> <button onClick={() => setView('dashboard')} className="flex items-center text-blue-400 hover:text-blue-300 mb-8"><ArrowLeft size={18} className="mr-2" /> Back to Dashboard</button> <h1 className="text-3xl font-bold mb-6">System Alerts</h1> <div className="space-y-4"> {alerts.length > 0 ? alerts.map(alert => (<div key={alert.id} className={`p-4 rounded-lg border-l-4 ${alert.level === 'critical' ? 'bg-red-900/50 border-red-500' : 'bg-yellow-900/50 border-yellow-500'}`}> <div className="flex items-start justify-between"> <div className="flex items-start"> <AlertTriangle className={`mr-4 mt-1 flex-shrink-0 ${alert.level === 'critical' ? 'text-red-400' : 'text-yellow-400'}`} size={24} /> <p className="text-white">{alert.message}</p> </div> <button onClick={() => handleSendAlertEmail(alert)} className="ml-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-1 px-3 rounded-lg flex items-center gap-2 transition-colors"> <Mail size={14} /> Notify </button> </div> </div>)) : <p className="text-gray-400">No active alerts. All projects are on track!</p>} </div> </div>);
      case 'dashboard':
      default:
        return (<div className="w-full"> <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"> <div> <h1 className="text-3xl font-bold">Launch Dashboard</h1> <p className="text-gray-400">Welcome, {session?.user?.name || 'User'}!</p> </div> <div className="flex items-center gap-4"> <button onClick={() => setView('alerts')} className="relative bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors"> <Mail size={20} className="mr-2" /> Alerts {alerts.length > 0 && <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-xs">{alerts.length}</span>} </button> <button onClick={() => setView('create')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"><Plus size={20} className="mr-2" /> New Launch</button> <button onClick={() => signOut()} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"><LogOut size={20} className="mr-2" /> Sign Out</button> </div> </header> <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {projectStats.map(project => (<div key={project.id} onClick={() => handleSelectProject(project)} className={`bg-slate-800 p-6 rounded-xl shadow-lg cursor-pointer hover:bg-slate-700/50 border border-slate-700 transition-all duration-300 ${project.isAtRisk ? 'border-red-500' : 'hover:border-blue-500'}`}> <div className="flex justify-between items-start"> <h3 className="font-bold text-xl mb-3">{project.name}</h3> {project.isAtRisk && <AlertTriangle className="text-red-500" />} </div> <div className="text-sm text-gray-400 mb-4 space-y-2"> <div className="flex items-center"><Calendar size={14} className="mr-2" /> Launch: {project.launchDate}</div> <div className="flex items-center"><User size={14} className="mr-2" /> {project.taskCount} Tasks</div> <div className="flex items-start"><User size={14} className="mr-2 mt-1" />Depts: <span className="flex flex-wrap gap-1 ml-1">{project.involvedDepts.map(d => <span key={d} className="text-xs bg-slate-700 px-1.5 py-0.5 rounded">{d}</span>)}</span></div> </div> <div className="w-full bg-slate-700 rounded-full h-2.5 mb-2"><div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div></div> <p className="text-right text-sm font-semibold text-gray-300">{project.progress}% Complete</p> </div>))} </div> </div>);
    }
  }

  return (
    <main className="min-h-screen w-full bg-slate-900 text-white flex items-center justify-center p-4 sm:p-8">
      <Notification message={notification?.message || ""} onClose={() => setNotification(null)} type={notification?.type || 'error'} />
      {renderContent()}
    </main>
  );
}

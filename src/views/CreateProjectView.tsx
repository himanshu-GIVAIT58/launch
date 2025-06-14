"use client";

import React, { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import InputField from "../components/InputField";
import SelectField from "../components/SelectField";
import { collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Define types locally or import them from a shared file
export type Department = "Marketing" | "Design" | "Finance" | "Supply" | "Merchandise";
export type View = "dashboard" | "create" | "project" | "alerts";
export interface Task {
  id?: string;
  name: string;
  assignedTo: { name: string; email: string };
  timeEstimate: number;
  status: "To Do" | "In Progress" | "Done";
  department: Department;
  dueDate: string;
}
export interface Alert {
  id: number;
  message: string;
  level: "warning" | "critical";
  taskName: string;
  department: Department;
  recipientEmail: string;
}

interface CreateProjectViewProps {
  setView: (view: View) => void;
  setNotification: (notification: { message: string; type: "error" | "success" }) => void;
}

const DEPARTMENTS: Department[] = ["Marketing", "Design", "Finance", "Supply", "Merchandise"];

const CreateProjectView: React.FC<CreateProjectViewProps> = ({ setView, setNotification }) => {
  const [createStep, setCreateStep] = useState(1);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectLaunchDate, setNewProjectLaunchDate] = useState("");
  const [newProjectTasks, setNewProjectTasks] = useState<Omit<Task, "id">[]>([]);
  const [taskName, setTaskName] = useState("");
  const [assignedToName, setAssignedToName] = useState("");
  const [assignedToEmail, setAssignedToEmail] = useState("");
  const [timeEstimate, setTimeEstimate] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskDepartment, setTaskDepartment] = useState<Department>(DEPARTMENTS[0]);

  const handleAddTask = () => {
    if (!taskName || !assignedToName || !assignedToEmail || !timeEstimate || !taskDueDate) {
      setNotification({ message: "Please fill all task fields.", type: "error" });
      return;
    }
    const newTask = {
      name: taskName,
      assignedTo: { name: assignedToName, email: assignedToEmail },
      timeEstimate: parseInt(timeEstimate, 10),
      status: "To Do" as const,
      department: taskDepartment,
      dueDate: taskDueDate,
    };
    setNewProjectTasks([...newProjectTasks, newTask]);
    setTaskName("");
    setAssignedToName("");
    setAssignedToEmail("");
    setTimeEstimate("");
    setTaskDueDate("");
  };

  const handleCreateProject = async () => {
    if (!newProjectName || !newProjectLaunchDate) {
      setNotification({ message: "Please fill project name and launch date.", type: "error" });
      return;
    }
    const tasksWithIds = newProjectTasks.map((task) => ({ ...task, id: Math.random().toString(36).substr(2, 9) }));
    try {
      // Using addDoc from firebase/firestore
      await import("firebase/firestore").then(async ({ addDoc }) => {
        await addDoc(collection(db, "projects"), {
          name: newProjectName,
          launchDate: newProjectLaunchDate,
          tasks: tasksWithIds,
        });
      });
      setNotification({ message: "Project created successfully!", type: "success" });
      setView("dashboard");
    } catch (error) {
      console.error("Error creating project: ", error);
      setNotification({ message: "Failed to create project.", type: "error" });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <button onClick={() => setView("dashboard")} className="flex items-center text-blue-400 hover:text-blue-300 mb-8">
        <ArrowLeft size={18} className="mr-2" /> Back
      </button>
      <div className="bg-slate-800 rounded-xl shadow-2xl p-8">
        {createStep === 1 ? (
          <div>
            <h2 className="text-2xl font-bold mb-6">Create New Launch Project</h2>
            <div className="space-y-4">
              <InputField
                icon={<ArrowLeft />} // Replace with a proper icon for project name
                type="text"
                placeholder="Launch Name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
              <InputField
                icon={<ArrowLeft />} // Replace with a calendar icon ideally
                type="date"
                value={newProjectLaunchDate}
                onChange={(e) => setNewProjectLaunchDate(e.target.value)}
              />
            </div>
            <button
              onClick={() => setCreateStep(2)}
              disabled={!newProjectName || !newProjectLaunchDate}
              className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg disabled:bg-gray-500"
            >
              Next: Add Tasks
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-2">Add Tasks for &quot;{newProjectName}&quot;</h2>
            <div className="bg-slate-700 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InputField
                  icon={<ArrowLeft />} // Replace with an appropriate icon
                  type="text"
                  placeholder="Task Name"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                />
                <SelectField
                  icon={<ArrowLeft />} // Replace with proper icon
                  value={taskDepartment}
                  onChange={(e) => setTaskDepartment(e.target.value as Department)}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </SelectField>
                <InputField
                  icon={<ArrowLeft />} // Replace with clock icon ideally
                  type="number"
                  placeholder="Time Estimate (hrs)"
                  value={timeEstimate}
                  onChange={(e) => setTimeEstimate(e.target.value)}
                />
                <InputField
                  icon={<ArrowLeft />} // Use calendar icon ideally
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
                <InputField
                  icon={<ArrowLeft />} // Replace with user icon
                  type="text"
                  placeholder="Assignee Name"
                  value={assignedToName}
                  onChange={(e) => setAssignedToName(e.target.value)}
                />
                <InputField
                  icon={<ArrowLeft />} // Replace with AtSign icon
                  type="email"
                  placeholder="Assignee Email"
                  value={assignedToEmail}
                  onChange={(e) => setAssignedToEmail(e.target.value)}
                />
              </div>
              <button onClick={handleAddTask} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                <Plus size={16} className="mr-2" />Add Task
              </button>
            </div>
            <h3 className="font-semibold text-lg mb-4">Tasks Added ({newProjectTasks.length})</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {newProjectTasks.map((task, index) => (
                <div key={index} className="bg-slate-700 p-3 rounded-lg flex justify-between items-center">
                  <span>
                    {task.name} ({task.department})
                  </span>
                  <span className="text-gray-400 text-sm">
                    {task.assignedTo.name} / {task.assignedTo.email}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-8">
              <button onClick={() => setCreateStep(1)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg">
                Back
              </button>
              <button onClick={handleCreateProject} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg">
                Create Project
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateProjectView;

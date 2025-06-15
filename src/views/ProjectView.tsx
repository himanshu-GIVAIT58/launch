"use client";

import React, { useState } from "react";
import { ArrowLeft, Calendar } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import KanbanColumn from "../components/KanbanColumn";

export type Department = "Marketing" | "Design" | "Finance" | "Supply" | "Merchandise";
export type View = "dashboard" | "create" | "project" | "alerts";
export interface Task {
  id: string;
  name: string;
  assignedTo: { name: string; email: string };
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

interface ProjectViewProps {
  project: Project;
  setView: (view: View) => void;
  setNotification: (notification: { message: string; type: "error" | "success" }) => void;
}

const ProjectView: React.FC<ProjectViewProps> = ({ project, setView, setNotification }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editProjectName, setEditProjectName] = useState(project.name);
  const [editLaunchDate, setEditLaunchDate] = useState(project.launchDate);
  const [editedTasks, setEditedTasks] = useState(project.tasks);

  const handleTaskChange = (index: number, field: "name" | "timeEstimate", value: string) => {
    const newTasks = [...editedTasks];
    newTasks[index] = {
      ...newTasks[index],
      [field]: field === "timeEstimate" ? parseInt(value, 10) : value,
    };
    setEditedTasks(newTasks);
  };

  const saveEdits = async () => {
    const projectRef = doc(db, "projects", project.id);
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

  const onDrop = async (e: React.DragEvent, newStatus: Task["status"]) => {
    const taskId = e.dataTransfer.getData("taskId");
    const updatedTasks = project.tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    const projectRef = doc(db, "projects", project.id);
    try {
      await updateDoc(projectRef, { tasks: updatedTasks });
    } catch (error) {
      console.error("Error updating task status: ", error);
      setNotification({ message: "Failed to update task.", type: "error" });
    }
  };

  return (
    <div className="w-full">
      <button onClick={() => setView("dashboard")} className="flex items-center text-blue-400 hover:text-blue-300 mb-4">
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
            <button onClick={saveEdits} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">
              Save Changes
            </button>
            <button onClick={() => setIsEditing(false)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
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
            <button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
              Edit Project
            </button>
          </div>
            <div className="flex flex-col lg:flex-row gap-6">
            <KanbanColumn status="To Do" tasks={project.tasks.filter((t) => t.status === "To Do")} onDrop={onDrop} onDragOver={(e) => e.preventDefault()} />
            <KanbanColumn status="In Progress" tasks={project.tasks.filter((t) => t.status === "In Progress")} onDrop={onDrop} onDragOver={(e) => e.preventDefault()} />
            <KanbanColumn status="Done" tasks={project.tasks.filter((t) => t.status === "Done")} onDrop={onDrop} onDragOver={(e) => e.preventDefault()} />
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectView;

"use client";

import React from "react";
import { GripVertical, AlertTriangle, Clock, User } from "lucide-react";

export type Department = "Marketing" | "Design" | "Finance" | "Supply" | "Merchandise";

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

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  isOverdue: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart, isOverdue }) => {
  const deptColors: Record<Department, string> = {
    Design: "bg-purple-500",
    Marketing: "bg-blue-500",
    Finance: "bg-green-500",
    Supply: "bg-orange-500",
    Merchandise: "bg-pink-500",
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className={`bg-slate-800 p-4 rounded-lg shadow-lg mb-4 cursor-grab active:cursor-grabbing border-l-4 ${isOverdue && task.status !== "Done" ? "border-red-500" : "border-slate-700"
        } hover:border-blue-500 transition-all duration-200`}
    >
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
        <div className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${deptColors[task.department]}`}>
          {task.department}
        </div>
        {isOverdue && task.status !== "Done" && <AlertTriangle size={16} className="text-red-500" />}
      </div>
    </div>
  );
};

export default TaskCard;

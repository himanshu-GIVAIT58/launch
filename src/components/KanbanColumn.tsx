"use client";

import React from "react";
import { Circle, MoreHorizontal, CheckCircle } from "lucide-react";
import TaskCard, { Task } from "./TaskCard";

interface KanbanColumnProps {
  status: Task["status"];
  tasks: Task[];
  onDrop: (e: React.DragEvent, status: Task["status"]) => void;
  onDragOver: (e: React.DragEvent) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, tasks, onDrop, onDragOver }) => {
  const statusConfig: Record<string, { icon: React.ReactNode; color: string }> = {
    "To Do": { icon: <Circle className="text-yellow-400" />, color: "border-yellow-400" },
    "In Progress": { icon: <MoreHorizontal className="text-blue-400" />, color: "border-blue-400" },
    Done: { icon: <CheckCircle className="text-green-400" />, color: "border-green-400" },
  };
  const config = statusConfig[status];
  return (
    <div className="bg-slate-900 rounded-xl p-4 flex-1 min-h-[60vh]" onDrop={(e) => onDrop(e, status)} onDragOver={onDragOver}>
      <div className={`flex items-center mb-4 pb-2 border-b-2 ${config.color}`}>
        {config.icon}
        <h3 className="font-bold text-lg ml-2 text-white">{status}</h3>
        <span className="ml-2 bg-slate-700 text-gray-300 text-sm font-semibold rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>
      <div className="h-full">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDragStart={(e, taskId) => {
              e.dataTransfer.setData("taskId", String(taskId));
            }}
            isOverdue={new Date(task.dueDate) < new Date(new Date().toISOString().split("T")[0])}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;

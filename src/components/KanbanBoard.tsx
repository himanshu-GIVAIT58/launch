"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Circle, MoreHorizontal, CheckCircle, Search, Plus, AlertCircle } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { collection, onSnapshot, updateDoc, doc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSession } from "next-auth/react";
// Handle drag-and-drop
import type { DragEndEvent } from "@dnd-kit/core";

// Define task status and department types
export type TaskStatus = "To Do" | "In Progress" | "Done";
export type Department = "Marketing" | "Design" | "Finance" | "Supply" | "Merchandise";

export interface Task {
  id: string;
  name: string;
  status: TaskStatus;
  assignedTo?: { name: string; email: string };
  timeEstimate?: number;
  department?: Department;
  dueDate?: string;
}

// Component props
interface KanbanBoardProps {
  demoMode: boolean;
  projectId?: string; // Required for authenticated mode
}

// Initial demo tasks
const demoTasks: Task[] = [
  { id: "1", name: "Design Homepage", status: "To Do", department: "Design", timeEstimate: 8, assignedTo: { name: "Priya K.", email: "priya@example.com" }, dueDate: "2025-06-20" },
  { id: "2", name: "Write Copy", status: "In Progress", department: "Marketing", timeEstimate: 4, assignedTo: { name: "Amit S.", email: "amit@example.com" }, dueDate: "2025-06-18" },
  { id: "3", name: "Launch Campaign", status: "Done", department: "Marketing", timeEstimate: 6, assignedTo: { name: "Sunita M.", email: "sunita@example.com" }, dueDate: "2025-06-15" },
];

// Status configuration with icons and colors
const statusConfig: Record<TaskStatus, { icon: React.ReactNode; color: string }> = {
  "To Do": { icon: <Circle className="text-yellow-400" />, color: "border-yellow-400" },
  "In Progress": { icon: <MoreHorizontal className="text-blue-400" />, color: "border-blue-400" },
  Done: { icon: <CheckCircle className="text-green-400" />, color: "border-green-400" },
};

// Mock analytics tracking
const trackEvent = (event: string, data: Record<string, unknown>) => {
  console.log(`Event: ${ event } `, data); // Replace with Firebase Analytics
};

import type { Session } from "next-auth";

const SortableTask: React.FC<{ task: Task; demoMode: boolean; session: Session | null }> = ({ task, demoMode, session }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      className="bg-slate-800 p-3 rounded-md mb-2 relative group"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${ task.name } `}
      whileHover={{ scale: demoMode && !session ? 1 : 1.02 }}
    >
      <p className="text-sm text-gray-300">{task.name}</p>
      {/* Task Details Popover */}
      {(task.assignedTo || task.dueDate) && (
        <div className="absolute hidden group-hover:block bg-slate-700 p-2 rounded-md shadow-lg z-10 left-0 top-full mt-1 text-xs text-gray-300">
          {task.assignedTo && <p>Assigned to: {task.assignedTo.name}</p>}
          {task.dueDate && <p>Due: {task.dueDate}</p>}
          {task.timeEstimate && <p>Estimate: {task.timeEstimate} hrs</p>}
          {task.department && <p>Department: {task.department}</p>}
        </div>
      )}
    </motion.div>
  );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ demoMode, projectId }) => {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<Task[]>(demoMode ? demoTasks : []);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(!demoMode);
  const [error, setError] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);

  // Setup dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch tasks from Firestore in authenticated mode
  useEffect(() => {
    if (demoMode || !projectId || status !== "authenticated") {
      setIsLoading(false);
      return;
    }

    const tasksCollection = collection(db, `projects / ${ projectId }/tasks`);
const unsubscribe = onSnapshot(
  tasksCollection,
  (snapshot) => {
    const fetchedTasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Task[];
    setTasks(fetchedTasks);
    setIsLoading(false);
  },
  (err) => {
    console.error("Error fetching tasks:", err);
    setError("Failed to load tasks.");
    setIsLoading(false);
  }
);
return () => unsubscribe();
  }, [demoMode, projectId, status]);


const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event;
  if (!over) return;

  const activeTaskId = active.id;
  const overId = over.id;

  // Determine if dropped on a column or another task
  const isColumnDrop = columns.includes(overId as TaskStatus);
  const newStatus = isColumnDrop ? (overId as TaskStatus) : tasks.find((task) => task.id === overId)?.status;

  if (!newStatus) return;

  const activeTask = tasks.find((task) => task.id === activeTaskId);
  if (!activeTask || activeTask.status === newStatus) return;

  const updatedTasks = tasks.map((task) =>
    task.id === activeTaskId ? { ...task, status: newStatus } : task
  );

  if (demoMode) {
    setTasks(updatedTasks);
    trackEvent("task_moved", { taskId: activeTaskId, newStatus });
  } else if (projectId && status === "authenticated") {
    try {
      const taskRef = doc(db, `projects/${projectId}/tasks`, String(activeTaskId));
      await updateDoc(taskRef, { status: newStatus });
      trackEvent("task_moved", { taskId: activeTaskId, newStatus });
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task status.");
    }
  }
};

// Handle task addition
const handleAddTask = async () => {
  if (!newTaskName || demoMode || !projectId || status !== "authenticated") return;

  try {
    await addDoc(collection(db, `projects/${projectId}/tasks`), {
      name: newTaskName,
      status: "To Do",
      assignedTo: { name: session.user?.name || "Unassigned", email: session.user?.email || "" },
      timeEstimate: 0,
      department: "Unassigned",
      dueDate: new Date().toISOString().split("T")[0],
    });
    setNewTaskName("");
    setShowAddTask(false);
    trackEvent("task_added", { projectId, taskName: newTaskName });
  } catch (err) {
    console.error("Error adding task:", err);
    setError("Failed to add task.");
  }
};

// Filter tasks based on search query
const filteredTasks = tasks.filter((task) =>
  task.name.toLowerCase().includes(searchQuery.toLowerCase())
);

const columns: TaskStatus[] = ["To Do", "In Progress", "Done"];

return (
  <div className="space-y-6">
    {/* Search and Add Task Controls */}
    {!demoMode && status === "authenticated" && (
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search tasks"
          />
        </div>
        <button
          onClick={() => setShowAddTask(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
          aria-label="Add new task"
        >
          <Plus size={16} /> Add Task
        </button>
      </div>
    )}

    {/* Add Task Form */}
    <AnimatePresence>
      {showAddTask && !demoMode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-slate-800 p-4 rounded-lg"
        >
          <input
            type="text"
            placeholder="New task name"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-2 px-3 mb-2"
            aria-label="New task name"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddTask}
              disabled={!newTaskName}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg disabled:bg-gray-500"
              aria-label="Save new task"
            >
              Save
            </button>
            <button
              onClick={() => setShowAddTask(false)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg"
              aria-label="Cancel adding task"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Error Message */}
    {error && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 bg-red-600/20 border border-red-600 p-3 rounded-lg"
        role="alert"
      >
        <AlertCircle size={20} className="text-red-400" />
        <p className="text-sm text-red-400">{error}</p>
      </motion.div>
    )}

    {/* Loading State */}
    {isLoading && (
      <div className="flex justify-center items-center h-40">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-blue-400"
        >
          <Circle size={24} />
        </motion.div>
      </div>
    )}

    {/* Kanban Board */}
    {!isLoading && (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((columnStatus) => (
            <motion.div
              key={columnStatus}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className={`bg-slate-900 p-4 rounded-lg border-b-2 ${statusConfig[columnStatus].color}`}
              role="region"
              aria-label={`${columnStatus} tasks`}
            >
              <div className="flex items-center mb-4">
                {statusConfig[columnStatus].icon}
                <h3 className="ml-2 font-bold text-white">{columnStatus}</h3>
                <span className="ml-2 bg-slate-700 text-gray-300 text-sm font-semibold rounded-full px-2 py-0.5">
                  {filteredTasks.filter((task) => task.status === columnStatus).length}
                </span>
              </div>
              <SortableContext
                id={columnStatus}
                items={filteredTasks.filter((task) => task.status === columnStatus).map((task) => task.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="min-h-[200px]">
                  {filteredTasks
                    .filter((task) => task.status === columnStatus)
                    .map((task) => (
                      <SortableTask key={task.id} task={task} demoMode={demoMode} session={session} />
                    ))}
                </div>
              </SortableContext>
            </motion.div>
          ))}
        </div>
      </DndContext>
    )}
  </div>
);
};

  export default KanbanBoard;

"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface NotificationProps {
  message: string;
  onClose: () => void;
  type?: "error" | "success";
}

const Notification: React.FC<NotificationProps> = ({ message, onClose, type = "error" }) => {
  if (!message) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  const bgColor = type === "error" ? "bg-red-600" : "bg-green-600";

  return (
    <div className={`fixed top-5 right-5 ${bgColor} text-white py-2 px-4 rounded-lg shadow-lg z-50 flex items-center`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-3 text-white">
        <X size={18} />
      </button>
    </div>
  );
};

export default Notification;

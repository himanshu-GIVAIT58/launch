"use client";

import React from "react";
import { ArrowLeft, AlertTriangle, Mail } from "lucide-react";

export type View = "dashboard" | "create" | "project" | "alerts";
export interface Alert {
  id: number;
  message: string;
  level: "warning" | "critical";
  taskName: string;
  department: string;
  recipientEmail: string;
}

interface AlertsViewProps {
  alerts: Alert[];
  setView: (view: View) => void;
  setNotification: (notification: { message: string; type: "error" | "success" } | null) => void;
}

const AlertsView: React.FC<AlertsViewProps> = ({ alerts, setView, setNotification }) => {
  const handleSendAlertEmail = async (alert: Alert) => {
    setNotification({ message: `Notifying ${alert.recipientEmail}...`, type: "success" });
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: alert.recipientEmail,
          subject: `[DELAY] Task Overdue: ${alert.taskName}`,
          message: `This is an automated notification from LaunchPad. The following task is overdue: <strong>${alert.taskName}</strong> assigned to the <strong>${alert.department}</strong> department. This may affect the project timeline.`,
        }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message || "Unknown error");
      setNotification({ message: "Notification sent!", type: "success" });
    } catch (error) {
      console.error(error);
      setNotification({ message: "Failed to send notification.", type: "error" });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <button onClick={() => setView("dashboard")} className="flex items-center text-blue-400 hover:text-blue-300 mb-8">
        <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
      </button>
      <h1 className="text-3xl font-bold mb-6">System Alerts</h1>
      <div className="space-y-4">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div key={alert.id} className="p-4 rounded-lg border-l-4 bg-yellow-900/50 border-yellow-500">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <AlertTriangle className="mr-4 mt-1 flex-shrink-0 text-yellow-400" size={24} />
                  <p className="text-white">{alert.message}</p>
                </div>
                <button
                  onClick={() => handleSendAlertEmail(alert)}
                  className="ml-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-1 px-3 rounded-lg flex items-center gap-2"
                >
                  <Mail size={14} /> Notify
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No active alerts. All projects are on track!</p>
        )}
      </div>
    </div>
  );
};

export default AlertsView;

import React, { useEffect, useState } from "react";
import { Info, CheckCircle, AlertTriangle, XCircle, X } from "lucide-react";

export interface NotificationProps {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Close notification after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Allow animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  // Handle manual close
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  // Icon based on type
  const Icon = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: XCircle,
  }[type];

  // Colors based on type
  const colors = {
    info: "border-blue-500 bg-blue-50 text-blue-800",
    success: "border-green-500 bg-green-50 text-green-800",
    warning: "border-yellow-500 bg-yellow-50 text-yellow-800",
    error: "border-red-500 bg-red-50 text-red-800",
  }[type];

  const iconColors = {
    info: "text-blue-500",
    success: "text-green-500",
    warning: "text-yellow-500",
    error: "text-red-500",
  }[type];

  return (
    <div
      className={`max-w-sm w-full shadow-lg rounded-lg pointer-events-auto border-l-4 ${colors} ${
        isVisible ? "animate-in slide-in-from-right-5" : "animate-out slide-out-to-right-5"
      }`}
    >
      <div className="flex items-start p-4">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${iconColors}`} />
        </div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-1 text-sm">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={handleClose}
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;

"use client";

import React from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({ icon, ...props }) => {
  return (
    <div className="relative flex items-center">
      <span className="absolute left-3 text-gray-400">{icon}</span>
      <input
        {...props}
        className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default InputField;

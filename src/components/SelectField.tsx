"use client";

import React from "react";

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SelectField: React.FC<SelectFieldProps> = ({ icon, children, ...props }) => {
  return (
    <div className="relative flex items-center">
      <span className="absolute left-3 text-gray-400">{icon}</span>
      <select
        {...props}
        className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
      >
        {children}
      </select>
    </div>
  );
};

export default SelectField;

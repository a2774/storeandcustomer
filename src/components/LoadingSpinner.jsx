import React from "react";
import { FaSpinner } from "react-icons/fa";

const LoadingSpinner = ({ 
  size = "md", 
  text = "Loading...", 
  fullScreen = false,
  className = "" 
}) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.md;

  if (fullScreen) {
    return (
      <div className={`flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 ${className}`}>
        <div className="text-center">
          <FaSpinner className={`${spinnerSize} animate-spin text-indigo-600 mx-auto`} />
          {text && <p className="mt-4 text-gray-600 font-medium">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        <FaSpinner className={`${spinnerSize} animate-spin text-indigo-600 mx-auto`} />
        {text && <p className="mt-2 text-gray-600 text-sm">{text}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;

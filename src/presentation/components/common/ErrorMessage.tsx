'use client';

import React from 'react';

interface ErrorMessageProps {
  message: string;
  retry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  retry, 
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-6 text-center bg-red-50 rounded-lg border border-red-200 ${className}`}>
      <svg
        className="w-12 h-12 text-red-500 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 className="text-lg font-semibold text-red-800 mb-2">Đã xảy ra lỗi</h3>
      <p className="text-red-600 mb-4">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Thử lại
        </button>
      )}
    </div>
  );
};

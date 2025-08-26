import React from 'react';
import { FaTimesCircle } from 'react-icons/fa';

interface ErrorToastProps {
  message: string;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ message }) => {
  return (
    <div className="flex items-center p-4 bg-red-600 text-white rounded-lg shadow-lg">
      <FaTimesCircle className="text-xl mr-3" />
      <span className="font-semibold text-lg">{message}</span>
    </div>
  );
};

export default ErrorToast;
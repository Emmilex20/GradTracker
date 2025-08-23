import React from 'react';
import { FaTimes } from 'react-icons/fa';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    // Return null if the modal is not open
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in"
             onClick={onClose}
        >
            <div
                className="relative w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-6 transform transition-all duration-300 scale-100 animate-slide-up-fade h-fit max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors text-2xl p-2 rounded-full hover:bg-gray-100"
                    aria-label="Close modal"
                >
                    <FaTimes />
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;
import React from 'react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error';
    show: boolean;
    onClose: () => void;
    children?: React.ReactNode;
    link?: string;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', show, onClose, children, link }) => {
    if (!show) return null;
    return (
        <div
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-4 min-w-[300px]
        ${type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'}`}
        >
            <span className="flex-1">{message}</span>
            {link && (
                <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 underline break-all text-blue-200 hover:text-blue-100"
                >
                    {link}
                </a>
            )}
            {children}
            <button
                onClick={onClose}
                className="ml-2 text-xl font-bold hover:text-gray-300 focus:outline-none"
                aria-label="Close"
            >
                ×
            </button>
        </div>
    );
};

export default Toast; 
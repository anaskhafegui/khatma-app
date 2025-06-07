import React from 'react';

const Loading: React.FC = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
    </div>
);

export default Loading; 
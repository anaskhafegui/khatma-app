import React, { useState } from 'react';
import Toast from '../components/Toast';

const ToastTest: React.FC = () => {
    const [show, setShow] = useState(false);
    const [copied, setCopied] = useState(false);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <button
                className="mb-4 px-4 py-2 bg-green-600 text-white rounded"
                onClick={() => setShow(true)}
            >
                Show Toast
            </button>
            <Toast
                message="This is a test toast!"
                type="success"
                show={show}
                onClose={() => setShow(false)}
                link="https://example.com"
            >
                <button
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded ml-2"
                    onClick={() => {
                        navigator.clipboard.writeText('https://example.com');
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                    }}
                >
                    {copied ? 'Copied!' : 'Copy Link'}
                </button>
            </Toast>
        </div>
    );
};

export default ToastTest; 
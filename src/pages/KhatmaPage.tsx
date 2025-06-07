import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Loading from '../components/Loading';
import { db } from '../firebase/firebase';

interface Surah {
    id: number;
    name: string;
    nameEn: string;
    assignedTo: string | null;
    readCount: number;
}

interface Khatma {
    title: string;
    isLocked: boolean;
    surahs: Surah[];
    status: string;
}

const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'started', label: 'Started' },
    { value: 'ended', label: 'Ended' },
];

const KhatmaPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const isAdmin = searchParams.get('admin') === '1';
    const [khatma, setKhatma] = useState<Khatma | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        getDoc(doc(db, 'khatmas', id))
            .then((snap) => {
                if (snap.exists()) {
                    setKhatma(snap.data() as Khatma);
                } else {
                    setError('Khatma not found');
                }
            })
            .catch(() => setError('Failed to load Khatma'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleAssign = async (idx: number, name: string) => {
        if (!khatma || khatma.isLocked) return;
        const newSurahs = khatma.surahs.map((s, i) =>
            i === idx ? { ...s, assignedTo: name } : s
        );
        setKhatma({ ...khatma, surahs: newSurahs });
        setSaving(true);
        await updateDoc(doc(db, 'khatmas', id!), { surahs: newSurahs });
        setSaving(false);
    };

    const handleIncrement = async (idx: number) => {
        if (!khatma || khatma.isLocked) return;
        const newSurahs = khatma.surahs.map((s, i) =>
            i === idx ? { ...s, readCount: s.readCount + 1 } : s
        );
        setKhatma({ ...khatma, surahs: newSurahs });
        setSaving(true);
        await updateDoc(doc(db, 'khatmas', id!), { surahs: newSurahs });
        setSaving(false);
    };

    const handleLock = async (locked: boolean) => {
        if (!khatma) return;
        setKhatma({ ...khatma, isLocked: locked });
        setSaving(true);
        await updateDoc(doc(db, 'khatmas', id!), { isLocked: locked });
        setSaving(false);
    };

    const handleStatusChange = async (status: string) => {
        if (!khatma) return;
        setKhatma({ ...khatma, status });
        setSaving(true);
        await updateDoc(doc(db, 'khatmas', id!), { status });
        setSaving(false);
    };

    if (loading) return <Loading />;
    if (error) return <div className="text-center text-red-600 mt-10">{error}</div>;
    if (!khatma) return null;

    const total = khatma.surahs.length;
    const assigned = khatma.surahs.filter(s => s.assignedTo).length;
    const fullyRead = khatma.surahs.filter(s => s.readCount >= 1).length;
    const progress = total ? Math.round((fullyRead / total) * 100) : 0;

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">{khatma.title}</h1>
            <div className="mb-4 flex items-center gap-4">
                <span className="font-semibold">Khatma ID:</span> <span className="text-gray-500">{id}</span>
                {isAdmin && (
                    <>
                        <button
                            className={`ml-auto px-3 py-1 rounded ${khatma.isLocked ? 'bg-gray-400' : 'bg-green-500 text-white'}`}
                            onClick={() => handleLock(!khatma.isLocked)}
                            disabled={saving}
                        >
                            {khatma.isLocked ? 'Unlock' : 'Lock'}
                        </button>
                        <div className="ml-4 flex items-center gap-2">
                            <span className="font-semibold">Status:</span>
                            <select
                                value={khatma.status}
                                onChange={e => handleStatusChange(e.target.value)}
                                className="border rounded px-2 py-1 text-sm"
                                disabled={saving}
                            >
                                {statusOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </>
                )}
                {!isAdmin && (
                    <span className="ml-auto px-2 py-0.5 rounded text-xs bg-gray-200">Status: {khatma.status}</span>
                )}
                {khatma.isLocked && <span className="ml-2 text-red-500">Locked</span>}
            </div>
            <div className="mb-6">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-4 bg-green-500 transition-all"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <div className="text-sm text-gray-600 mt-1">Progress: {progress}%</div>
            </div>
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {khatma.surahs.map((s, idx) => (
                    <div key={s.id} className="bg-gray-50 p-3 rounded shadow flex flex-col gap-2">
                        <div className="font-semibold">{s.name} ({s.nameEn})</div>
                        <div className="flex items-center gap-2">
                            <span>Assigned to:</span>
                            {s.assignedTo || khatma.isLocked ? (
                                <span className="text-blue-700 font-medium">{s.assignedTo || '-'}</span>
                            ) : (
                                <input
                                    type="text"
                                    className="border rounded px-2 py-1 text-sm"
                                    placeholder="Enter name"
                                    defaultValue={s.assignedTo || ''}
                                    onBlur={e => handleAssign(idx, e.target.value)}
                                    disabled={saving}
                                />
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span>Read count:</span>
                            <span className="font-bold">{s.readCount}</span>
                            {!khatma.isLocked && (
                                <button
                                    className="ml-2 px-2 py-1 bg-green-200 rounded hover:bg-green-300"
                                    onClick={() => handleIncrement(idx)}
                                    disabled={saving}
                                >
                                    +1
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-gray-100 p-4 rounded flex flex-wrap gap-6 justify-between">
                <div>Total Surahs: <span className="font-bold">{total}</span></div>
                <div>Assigned: <span className="font-bold">{assigned}</span></div>
                <div>Fully Read: <span className="font-bold">{fullyRead}</span></div>
            </div>
        </div>
    );
};

export default KhatmaPage; 
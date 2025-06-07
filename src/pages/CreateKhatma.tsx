import { zodResolver } from '@hookform/resolvers/zod';
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import { db } from '../firebase/firebase';
import { surahList } from '../utils/surahList';
import { Lang, translations } from '../utils/translations';

const schema = z.object({
    title: z.string().min(1, 'Title is required'),
    surahs: z.array(z.number()).min(1, 'Select at least one surah'),
});

type FormValues = z.infer<typeof schema>;

const defaultSurahs = surahList.map((_, i) => i);

type KhatmaHistoryItem = { id: string; title: string; status: string };

const CreateKhatma: React.FC = () => {
    const [lang, setLang] = useState<Lang>('ar');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error'; link?: string; adminLink?: string } | null>(null);
    const [copied, setCopied] = useState(false);
    const [createdLinks, setCreatedLinks] = useState<{ user: string; admin: string } | null>(null);
    const [khatmaHistory, setKhatmaHistory] = useState<KhatmaHistoryItem[]>([]);
    const [activeKhatmas, setActiveKhatmas] = useState<KhatmaHistoryItem[]>([]);
    const t = translations[lang];

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { title: '', surahs: defaultSurahs },
    });

    const surahs = watch('surahs');

    // Load khatma history from localStorage and fetch their status from Firestore
    useEffect(() => {
        const stored = localStorage.getItem('khatmaHistory');
        if (stored) {
            const arr: { id: string; title: string }[] = JSON.parse(stored);
            if (arr.length) {
                Promise.all(
                    arr.map(async (item) => {
                        const snap = await getDoc(doc(db, 'khatmas', item.id));
                        let status = 'unknown';
                        if (snap.exists()) {
                            status = snap.data().status || 'pending';
                        }
                        return { ...item, status };
                    })
                ).then((full) => {
                    setKhatmaHistory(full);
                    setActiveKhatmas(full.filter(k => k.status !== 'ended'));
                });
            }
        }
    }, []);

    const onSubmit = async (data: FormValues) => {
        setLoading(true);
        try {
            const surahs = data.surahs.map(idx => ({
                id: idx + 1,
                name: lang === 'ar' ? surahList[idx].name : surahList[idx].nameEn,
                nameEn: surahList[idx].nameEn,
                assignedTo: null,
                readCount: 0,
            }));
            const docRef = await addDoc(collection(db, 'khatmas'), {
                title: data.title,
                createdAt: serverTimestamp(),
                isLocked: false,
                surahs,
                status: 'pending',
            });
            const baseLink = window.location.origin + '/khatma/' + docRef.id;
            setToast({
                message: t.createdSuccess,
                type: 'success',
                link: baseLink,
            });
            setCreatedLinks({ user: baseLink, admin: baseLink + '?admin=1' });
            // Save to localStorage
            const newItem = { id: docRef.id, title: data.title };
            const prev = localStorage.getItem('khatmaHistory');
            let arr: { id: string; title: string }[] = prev ? JSON.parse(prev) : [];
            arr = [newItem, ...arr.filter(i => i.id !== newItem.id)];
            localStorage.setItem('khatmaHistory', JSON.stringify(arr));
            // Update state
            setKhatmaHistory([{ ...newItem, status: 'pending' }, ...khatmaHistory]);
            setActiveKhatmas([{ ...newItem, status: 'pending' }, ...activeKhatmas]);
        } catch (e) {
            setToast({ message: t.createError, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const allSelected = surahs.length === surahList.length;

    const handleSelectAll = (checked: boolean) => {
        setValue('surahs', checked ? defaultSurahs : []);
    };

    const handleSurahChange = (idx: number, checked: boolean) => {
        if (checked) {
            setValue('surahs', Array.from(new Set([...surahs, idx])));
        } else {
            setValue('surahs', surahs.filter((i) => i !== idx));
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-8 mt-10">
            {loading && <Loading />}
            <Toast
                message={toast?.message || ''}
                type={toast?.type}
                show={!!toast}
                onClose={() => setToast(null)}
            >
                {toast?.link && (
                    <>
                        <button
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded ml-2"
                            onClick={() => {
                                navigator.clipboard.writeText(toast.link!);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 1500);
                            }}
                        >
                            {copied ? 'Copied!' : 'Copy Link'}
                        </button>
                        <span className="ml-2 underline break-all">{toast.link}</span>
                    </>
                )}
            </Toast>
            {createdLinks && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
                    <div className="mb-2 font-semibold">Links to your Khatma:</div>
                    <div className="mb-1">
                        <span className="font-medium">User Link: </span>
                        <a href={createdLinks.user} target="_blank" rel="noopener noreferrer" className="underline text-blue-700 break-all">{createdLinks.user}</a>
                    </div>
                    <div>
                        <span className="font-medium">Admin Link: </span>
                        <a href={createdLinks.admin} target="_blank" rel="noopener noreferrer" className="underline text-blue-700 break-all">{createdLinks.admin}</a>
                    </div>
                </div>
            )}
            <div className="flex justify-end mb-4 gap-2">
                <button
                    className={`px-3 py-1 rounded ${lang === 'en' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setLang('en')}
                >
                    English
                </button>
                <button
                    className={`px-3 py-1 rounded ${lang === 'ar' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setLang('ar')}
                >
                    العربية
                </button>
            </div>
            <h1 className="text-2xl font-bold text-center mb-6">{t.title}</h1>
            {khatmaHistory.length > 0 && (
                <div className="mb-8">
                    <div className="font-bold mb-2">Your Khatma History:</div>
                    <div className="space-y-1">
                        {khatmaHistory.map(k => (
                            <div key={k.id} className="flex items-center gap-2 text-sm">
                                <a href={`/khatma/${k.id}`} className="underline text-blue-700 break-all" target="_blank" rel="noopener noreferrer">{k.title}</a>
                                <span className="px-2 py-0.5 rounded text-xs bg-gray-200 ml-2">{k.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {activeKhatmas.length > 0 && (
                <div className="mb-8">
                    <div className="font-bold mb-2">Active Khatmas:</div>
                    <div className="space-y-1">
                        {activeKhatmas.map(k => (
                            <div key={k.id} className="flex items-center gap-2 text-sm">
                                <a href={`/khatma/${k.id}`} className="underline text-green-700 break-all" target="_blank" rel="noopener noreferrer">{k.title}</a>
                                <span className="px-2 py-0.5 rounded text-xs bg-green-100 ml-2">{k.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)}>
                <input
                    className="w-full mb-4 p-3 border-2 border-gray-200 rounded-lg focus:border-green-500"
                    placeholder={t.titlePlaceholder}
                    {...register('title')}
                />
                {errors.title && (
                    <div className="text-red-500 text-sm mb-2">{errors.title.message}</div>
                )}
                <div className="mb-2 font-medium">{t.selectSurahs}</div>
                <div className="flex items-center mb-2">
                    <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="mr-2"
                        id="selectAll"
                    />
                    <label htmlFor="selectAll">{t.selectAll}</label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto border rounded p-2 bg-gray-50 mb-4">
                    {surahList.map((s, idx) => (
                        <div key={idx} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`surah-${idx}`}
                                checked={surahs.includes(idx)}
                                onChange={(e) => handleSurahChange(idx, e.target.checked)}
                                className="mr-2"
                            />
                            <label htmlFor={`surah-${idx}`} className="truncate cursor-pointer">
                                {lang === 'ar' ? s.name : s.nameEn}
                            </label>
                        </div>
                    ))}
                </div>
                {errors.surahs && (
                    <div className="text-red-500 text-sm mb-2">{errors.surahs.message}</div>
                )}
                <button
                    type="submit"
                    className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg mt-2"
                >
                    {t.createButton}
                </button>
            </form>
        </div>
    );
};

export default CreateKhatma; 

import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase.ts';
import { CloseIcon, Spinner } from '../ui/Icons.tsx';
import { CUSTOM_HABIT_ICONS } from '../habits/AddHabitModal.tsx';

interface LibrarySettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LibrarySettingsModal: React.FC<LibrarySettingsModalProps> = ({ isOpen, onClose }) => {
    const [selectedIcon, setSelectedIcon] = useState('📖');
    const [coverHeight, setCoverHeight] = useState<number>(192); // Default 192px (h-48)
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            const fetchConfig = async () => {
                const configRef = doc(db, 'app_config', 'library_config');
                const docSnap = await getDoc(configRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.bookCoverIcon) setSelectedIcon(data.bookCoverIcon);
                    if (data.coverHeight) setCoverHeight(data.coverHeight);
                }
                setLoading(false);
            };
            fetchConfig();
        }
    }, [isOpen]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const configRef = doc(db, 'app_config', 'library_config');
            await setDoc(configRef, { 
                bookCoverIcon: selectedIcon,
                coverHeight: coverHeight
            }, { merge: true });
            onClose();
        } catch (error) {
            console.error("Error saving library config:", error);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="w-full max-w-md bg-sky-950/90 border border-sky-500/50 rounded-lg flex flex-col max-h-[80vh]">
                <header className="flex items-center justify-between p-4 border-b border-sky-400/30 flex-shrink-0">
                    <h2 className="text-xl font-bold text-sky-200">إعدادات مظهر المكتبة</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><CloseIcon className="w-6 h-6" /></button>
                </header>
                
                <main className="p-6 overflow-y-auto space-y-8">
                    {loading ? (
                        <div className="flex justify-center"><Spinner className="w-8 h-8" /></div>
                    ) : (
                        <>
                            {/* Cover Size Section */}
                            <div className="space-y-4">
                                <label className="block text-sky-200 font-bold mb-2">
                                    حجم (ارتفاع) صور الكتب: <span className="text-yellow-400">{coverHeight}px</span>
                                </label>
                                <input 
                                    type="range" 
                                    min="120" 
                                    max="400" 
                                    step="10"
                                    value={coverHeight} 
                                    onChange={(e) => setCoverHeight(Number(e.target.value))}
                                    className="w-full h-2 bg-sky-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                                />
                                <div className="flex justify-center mt-4">
                                    <div 
                                        className="bg-sky-800/50 border border-sky-600 rounded-md flex items-center justify-center text-sky-400 text-sm shadow-lg transition-all duration-300"
                                        style={{ width: '120px', height: `${coverHeight}px` }}
                                    >
                                        معاينة الحجم
                                    </div>
                                </div>
                                <p className="text-xs text-sky-400 text-center">حرك المؤشر لتغيير ارتفاع الصور وتوحيد شكل المكتبة.</p>
                            </div>

                            <div className="border-t border-sky-700/50"></div>

                            {/* Icon Picker Section */}
                            <div className="space-y-2">
                                <label className="block text-sky-200 font-bold mb-2">الأيقونة الافتراضية للكتب:</label>
                                <div className="grid grid-cols-6 gap-2">
                                    {CUSTOM_HABIT_ICONS.slice(0, 24).map((icon, index) => (
                                        <button 
                                            key={index} 
                                            onClick={() => setSelectedIcon(icon)} 
                                            className={`aspect-square flex items-center justify-center text-2xl rounded-lg transition-transform duration-200 hover:scale-110 ${selectedIcon === icon ? 'bg-sky-500 ring-2 ring-white' : 'bg-sky-800/60 hover:bg-sky-700/80'}`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </main>

                <footer className="p-4 border-t border-sky-400/30 flex-shrink-0">
                    <button 
                        onClick={handleSave} 
                        disabled={saving || loading} 
                        className="w-full text-white font-bold py-3 px-4 rounded-lg transition-colors bg-teal-600 hover:bg-teal-500 disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {saving ? <Spinner className="w-5 h-5" /> : 'حفظ الإعدادات'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default LibrarySettingsModal;

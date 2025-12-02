
import React, { useState, useRef } from 'react';
import { CloseIcon, CameraIcon, Spinner } from './Icons.tsx';
import { uploadFile } from '../../services/uploadService.ts';

export const AVATAR_OPTIONS = [
    // A fresh set of reliable nature landscape images, now with higher resolution
    'https://images.unsplash.com/photo-1434725039720-aaad6dd32dfe?q=80&w=1200&auto=format&fit=crop', // 1. Misty mountains
    'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop', // 2. Green forest path
    'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=1200&auto=format&fit=crop', // 3. Beach with rock
    'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=1200&auto=format&fit=crop', // 4. Desert landscape
    'https://images.unsplash.com/photo-1487088678257-3a541e6e3922?q=80&w=1200&auto=format&fit=crop', // 5. Starry night sky
    'https://images.unsplash.com/photo-1598449356475-b9f71db7d847?q=80&w=1200&auto=format&fit=crop', // 6. Green terraced hills
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=1200&auto=format&fit=crop', // 7. Lakeside mountain view
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop', // 8. Snowy mountain peak
    'https://images.unsplash.com/photo-1505144808419-1957a94ca61e?q=80&w=1200&auto=format&fit=crop', // 9. Pink sunset over water
    'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=1200&auto=format&fit=crop', // 10. Northern Lights (Aurora)
    'https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=1200&auto=format&fit=crop', // 11. Majestic waterfall
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1200&auto=format&fit=crop'  // 12. Autumn forest
];


interface AvatarPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectAvatar: (url: string) => void;
}

const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({ isOpen, onClose, onSelectAvatar }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleSelect = (url: string) => {
        onSelectAvatar(url);
        onClose();
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            setError('حجم الصورة كبير جداً (أقصى حد 10 ميجابايت)');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const url = await uploadFile(file);
            onSelectAvatar(url);
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'فشل رفع الصورة. حاول مرة أخرى.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4" onClick={onClose}>
            <div 
                className="w-full max-w-md bg-sky-950/90 border border-sky-500/50 rounded-lg flex flex-col h-[70vh]"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-sky-400/30 flex-shrink-0">
                    <h2 className="text-xl font-bold text-sky-200">اختر صورة</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><CloseIcon className="w-6 h-6" /></button>
                </header>
                <main className="p-4 overflow-y-auto space-y-6">
                    
                    {/* Upload Section */}
                    <div className="bg-sky-900/40 p-4 rounded-xl border border-sky-600/30 text-center">
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            accept="image/*" 
                            className="hidden" 
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()} 
                            disabled={uploading}
                            className="flex flex-col items-center justify-center w-full py-4 space-y-2 group"
                        >
                            <div className="p-3 bg-sky-700/50 rounded-full group-hover:bg-sky-600/50 transition-colors">
                                {uploading ? <Spinner className="w-8 h-8 text-sky-300" /> : <CameraIcon className="w-8 h-8 text-sky-300" />}
                            </div>
                            <span className="text-sky-200 font-semibold group-hover:text-white transition-colors">
                                {uploading ? 'جاري الرفع...' : 'اضغط لرفع صورة من جهازك'}
                            </span>
                        </button>
                        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    </div>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-sky-700"></div>
                        <span className="flex-shrink mx-4 text-sky-400 text-sm">أو اختر من القائمة</span>
                        <div className="flex-grow border-t border-sky-700"></div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {AVATAR_OPTIONS.map((url, index) => (
                            <button key={index} onClick={() => handleSelect(url)} className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-sky-400 focus:border-sky-400 focus:outline-none transition group relative">
                                <img src={url} alt={`Avatar option ${index + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                            </button>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AvatarPickerModal;

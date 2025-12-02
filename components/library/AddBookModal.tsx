
import React, { useState, useRef } from 'react';
import type { User } from 'firebase/auth';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase.ts';
import type { Book, LibraryCategory } from '../../types.ts';
import { CloseIcon, Spinner, ImageIcon, DocumentIcon } from '../ui/Icons.tsx';
import { uploadFile } from '../../services/uploadService.ts';

interface EditBookModalProps {
    onClose: () => void;
    user: User;
    bookToEdit: Book | null;
    categories: LibraryCategory[];
}

const EditBookModal: React.FC<EditBookModalProps> = ({ onClose, user, bookToEdit, categories }) => {
    const [title, setTitle] = useState(bookToEdit?.title || '');
    const [description, setDescription] = useState(bookToEdit?.description || '');
    const [fileUrl, setFileUrl] = useState<string | null>(bookToEdit?.fileUrl || null);
    const [coverUrl, setCoverUrl] = useState<string | null>(bookToEdit?.coverUrl || null);
    const [categoryId, setCategoryId] = useState(bookToEdit?.categoryId || '');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Upload states
    const [uploadingFile, setUploadingFile] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'cover') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            setError(`حجم الملف كبير جداً (${type === 'pdf' ? 'الكتاب' : 'الغلاف'}). الحد الأقصى 10 ميجابايت.`);
            return;
        }

        setError('');
        if (type === 'pdf') setUploadingFile(true);
        else setUploadingCover(true);

        try {
            const url = await uploadFile(file);
            if (type === 'pdf') {
                setFileUrl(url);
            } else {
                setCoverUrl(url);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'فشل رفع الملف.');
        } finally {
            if (type === 'pdf') setUploadingFile(false);
            else setUploadingCover(false);
        }
    };

    const handleSave = async () => {
        if (!title.trim()) { setError("الرجاء إدخال عنوان الكتاب."); return; }
        if (!fileUrl) { setError("الرجاء رفع ملف الكتاب أو إدخال الرابط."); return; }
        if (!categoryId) { setError("الرجاء اختيار قسم."); return; }
        
        setError('');
        setLoading(true);

        const bookData = {
            title,
            description,
            fileUrl,
            coverUrl,
            categoryId,
            uploaderUid: user.uid,
            createdAt: bookToEdit?.createdAt || serverTimestamp(),
        };

        try {
            if (bookToEdit) {
                await updateDoc(doc(db, 'library', bookToEdit.id), bookData);
            } else {
                await addDoc(collection(db, 'library'), bookData);
            }
            onClose();
        } catch (err) {
            console.error("Error saving book:", err);
            setError("حدث خطأ أثناء حفظ الكتاب.");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md bg-sky-950/90 border border-sky-500/50 rounded-lg flex flex-col h-[90vh]">
                 <header className="flex items-center justify-between p-4 border-b border-sky-400/30 flex-shrink-0">
                    <h2 className="text-xl font-bold text-sky-200">{bookToEdit ? 'تعديل الكتاب' : 'إضافة كتاب جديد'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><CloseIcon className="w-6 h-6" /></button>
                </header>
                <main className="p-6 space-y-4 overflow-y-auto">
                    {error && <p className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded">{error}</p>}
                    
                    <input 
                        type="text" 
                        placeholder="عنوان الكتاب" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-sky-800/60 border border-sky-700 rounded-lg py-2 px-4 text-white placeholder-sky-400/70 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                     <textarea 
                        placeholder="وصف الكتاب (اختياري)" 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full h-24 bg-sky-800/60 border border-sky-700 rounded-lg py-2 px-4 text-white placeholder-sky-400/70 resize-none focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full bg-sky-800/60 border border-sky-700 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                        <option value="" disabled>اختر قسماً</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    {/* Book Cover Upload */}
                    <div className="space-y-2">
                        <label className="block text-sky-200 font-semibold text-sm">صورة الغلاف (اختياري)</label>
                        <div className="flex gap-2 items-center">
                            <input
                                type="file"
                                ref={coverInputRef}
                                onChange={(e) => handleFileChange(e, 'cover')}
                                accept="image/*"
                                className="hidden"
                            />
                            <button
                                onClick={() => coverInputRef.current?.click()}
                                disabled={uploadingCover}
                                className="flex items-center gap-2 px-4 py-2 bg-sky-700/50 hover:bg-sky-600/50 rounded-lg text-sky-200 transition-colors w-full justify-center border border-sky-600/30"
                            >
                                {uploadingCover ? <Spinner className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                                <span>{coverUrl ? 'تغيير الغلاف' : 'رفع صورة الغلاف'}</span>
                            </button>
                        </div>
                        {coverUrl && (
                            <div className="w-20 h-28 mx-auto mt-2 rounded overflow-hidden border border-sky-500/50 shadow-md">
                                <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    {/* PDF File Upload */}
                    <div className="space-y-2 pt-2 border-t border-sky-700/30">
                        <label className="block text-sky-200 font-semibold text-sm">ملف الكتاب (PDF)</label>
                        
                        {/* Option 1: Upload */}
                        <div className="flex gap-2 items-center">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => handleFileChange(e, 'pdf')}
                                accept="application/pdf"
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingFile}
                                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-white transition-colors w-full justify-center border ${fileUrl ? 'bg-green-600/50 border-green-500/50' : 'bg-sky-700/50 hover:bg-sky-600/50 border-sky-600/30'}`}
                            >
                                {uploadingFile ? <Spinner className="w-5 h-5" /> : <DocumentIcon className="w-5 h-5" />}
                                <span>{uploadingFile ? 'جاري الرفع...' : (fileUrl ? 'تم رفع الملف (اضغط للتغيير)' : 'رفع ملف PDF')}</span>
                            </button>
                        </div>

                        {/* Option 2: Direct URL Fallback */}
                        <div className="relative flex items-center py-1">
                            <div className="flex-grow border-t border-sky-800"></div>
                            <span className="flex-shrink mx-2 text-sky-500 text-xs">أو رابط مباشر</span>
                            <div className="flex-grow border-t border-sky-800"></div>
                        </div>

                        <input
                            type="url"
                            placeholder="https://example.com/book.pdf"
                            value={fileUrl || ''}
                            onChange={(e) => setFileUrl(e.target.value)}
                            className="w-full bg-sky-800/40 border border-sky-700 rounded-lg py-2 px-4 text-white text-sm placeholder-sky-400/50 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                    </div>

                </main>
                 <footer className="p-4 border-t border-sky-400/30 flex-shrink-0">
                    <button 
                        onClick={handleSave} 
                        disabled={loading || uploadingFile || uploadingCover} 
                        className="w-full text-white font-bold py-3 px-4 rounded-lg transition-colors bg-teal-600 hover:bg-teal-500 disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {loading ? <Spinner className="w-6 h-6" /> : 'حفظ الكتاب'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default EditBookModal;

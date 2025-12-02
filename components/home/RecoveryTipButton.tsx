import React, { useState } from 'react';
import { LightBulbIcon } from '../ui/Icons.tsx';
import { RECOVERY_TIPS } from '../../services/tips_content.ts';

const RecoveryTipButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentTip, setCurrentTip] = useState('');

    const handleOpen = () => {
        const randomTip = RECOVERY_TIPS[Math.floor(Math.random() * RECOVERY_TIPS.length)];
        setCurrentTip(randomTip);
        setIsOpen(true);
    };

    const handleNextTip = () => {
        let newTip;
        do {
            newTip = RECOVERY_TIPS[Math.floor(Math.random() * RECOVERY_TIPS.length)];
        } while (newTip === currentTip && RECOVERY_TIPS.length > 1);
        setCurrentTip(newTip);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <>
            <button
                onClick={handleOpen}
                className="group w-full p-4 rounded-xl text-white flex items-center justify-between bg-sky-950/50 backdrop-blur-sm border border-sky-700/40 transition-all duration-300 hover:bg-sky-900/70 hover:border-sky-600"
                aria-label="نصيحة تعافي"
            >
                <div className="text-right">
                    <h3 className="text-lg font-bold text-yellow-300">نصيحة تعافي</h3>
                    <p className="text-sm text-sky-400">إضاءة لطريقك</p>
                </div>
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg group-hover:shadow-yellow-500/30 transition-shadow">
                    <LightBulbIcon className="w-8 h-8 text-white" />
                </div>
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={handleClose}>
                    <div 
                        className="w-full max-w-sm bg-gradient-to-br from-sky-900 to-slate-900 border border-yellow-500/50 rounded-2xl p-8 text-center shadow-2xl shadow-yellow-500/10 relative" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-6">
                            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/30">
                                <LightBulbIcon className="w-10 h-10 text-yellow-300" />
                            </div>
                            <h3 className="text-2xl font-bold text-yellow-200 mb-2">نصيحة لك</h3>
                        </div>
                        
                        <p className="text-lg text-white leading-relaxed mb-8 font-medium">
                            "{currentTip}"
                        </p>

                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleNextTip}
                                className="w-full py-3 px-4 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white font-bold transition-colors shadow-lg"
                            >
                                نصيحة أخرى
                            </button>
                            <button 
                                onClick={handleClose}
                                className="w-full py-3 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-sky-200 font-semibold transition-colors"
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RecoveryTipButton;

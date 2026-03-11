import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EidPromoModalProps {
    onDesignShoes: () => void;
}

export function EidPromoModal({ onDesignShoes }: EidPromoModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // 2. State & Memory Management: Web Storage API
        const hasViewed = localStorage.getItem('eid_promo_viewed');

        // TEMPORARILY DISABLED FOR TESTING: 
        // Always show the pop-up even if they have seen it, so you can test it easily!
        // if (!hasViewed) {
        setIsOpen(true);
        // Immediately write to memory so it doesn't show again on refresh
        // localStorage.setItem('eid_promo_viewed', 'true');
        // }
    }, []);

    if (!isOpen) return null;

    // 1. Structural Architecture (Portals): Mount completely outside normal DOM flow
    // to avoid CSS stacking context / z-index trap issues.
    return ReactDOM.createPortal(
        /* 3. Event Handling (Bubbling): Backdrop closes modal */
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
        >
            {/* Target card stops event bubbling (e.stopPropagation) to prevent closing when clicking the card itself */}
            <div
                className="w-full max-w-md md:max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl transition-transform duration-500 scale-100 animate-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 4. UI/UX & Tailwind Styling: Two-column grid, responsive mobile-first architecture */}
                <div className="grid grid-cols-1 md:grid-cols-2 min-h-[500px]">

                    {/* Left Column: Image Container */}
                    <div className="relative h-64 md:h-full bg-zinc-100">
                        <img
                            src="/images/eid-promo.png"
                            alt="Premium Eid Footwear Promotion"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Elegant dark gradient overlay only on small screens to make UI look cleaner */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent md:hidden" />
                    </div>

                    {/* Right Column: Text & CTA */}
                    <div className="relative p-8 md:p-12 flex flex-col justify-center bg-zinc-50">
                        {/* Dismiss Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-900 transition-colors bg-white/80 rounded-full shadow-sm"
                            aria-label="Close promotion"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Premium Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-200 mb-6 w-fit shadow-sm">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">Eid Exclusive</span>
                        </div>

                        {/* Typography */}
                        <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4 font-playfair leading-tight">
                            Eid is Near.<br />
                            <span className="text-amber-600">Craft Your Perfect Pair.</span>
                        </h2>

                        <p className="text-zinc-600 mb-8 text-base md:text-lg leading-relaxed">
                            Step into the celebrations with footwear designed entirely by you.
                            Pakistan's master artisans will bring your unique AI-generated vision to life in time for Eid.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col gap-4 mt-auto md:mt-0">
                            <Button
                                onClick={() => {
                                    setIsOpen(false);
                                    // Trigger main router/view logic passed securely via prop
                                    onDesignShoes();
                                }}
                                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl py-6 text-lg font-semibold shadow-xl transition-all hover:scale-[1.02]"
                            >
                                <Sparkles className="w-5 h-5 mr-2" />
                                Design Your Shoes
                            </Button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-zinc-500 hover:text-zinc-800 text-sm font-medium transition-colors"
                            >
                                No thanks, I'll explore the site first
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>,
        document.body
    );
}

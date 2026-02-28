// SoleMate AI - Gender Selection
// Premium gender selection screen

import { ArrowRight, Sparkles } from 'lucide-react';
import type { Gender } from '@/types';

interface GenderSelectionProps {
  onSelectGender: (gender: Gender) => void;
}

export function GenderSelection({ onSelectGender }: GenderSelectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-playfair bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                SoleMate AI
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center pt-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-playfair text-slate-900 mb-4">
              Who are you shopping for?
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mx-auto">
              Select your preference to begin designing the perfect pair
            </p>
          </div>

          {/* Gender Cards */}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* Shop for Her */}
            <button
              onClick={() => onSelectGender('women')}
              className="group relative overflow-hidden rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500 text-left"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src="/images/gender/women-card.jpg"
                  alt="Shop for Her"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-500 text-white text-sm font-medium">
                    Women
                  </span>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h2 className="text-2xl lg:text-3xl font-bold font-playfair text-white mb-2 group-hover:text-amber-300 transition-colors">
                  Shop for Her
                </h2>
                <p className="text-white/80 text-sm mb-4">
                  Khussas, heels, sandals & more. From everyday essentials to luxe bridal wear.
                </p>
                
                <div className="flex items-center gap-2 text-amber-400 font-medium">
                  <span>Start Designing</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </button>

            {/* Shop for Him */}
            <button
              onClick={() => onSelectGender('men')}
              className="group relative overflow-hidden rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500 text-left"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src="/images/gender/men-card.jpg"
                  alt="Shop for Him"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-600 text-white text-sm font-medium">
                    Men
                  </span>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h2 className="text-2xl lg:text-3xl font-bold font-playfair text-white mb-2 group-hover:text-amber-300 transition-colors">
                  Shop for Him
                </h2>
                <p className="text-white/80 text-sm mb-4">
                  Loafers, Oxfords, Chelsea Boots, and Loro Piana style. Hand-stitched by master artisans.
                </p>
                
                <div className="flex items-center gap-2 text-amber-400 font-medium">
                  <span>Start Designing</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </button>
          </div>

          {/* Footer Note */}
          <div className="mt-12 text-center">
            <p className="text-sm text-slate-500">
              Every pair is handcrafted by skilled Pakistani artisans using premium materials
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

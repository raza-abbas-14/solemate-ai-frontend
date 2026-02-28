// SoleMate AI - Hero Section
// Clean white background design with shoe image on right

import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onStartDesigning: () => void;
  onLearnMore?: () => void;
}

export function HeroSection({ onStartDesigning, onLearnMore }: HeroSectionProps) {
  const handleLearnMore = () => {
    if (onLearnMore) {
      onLearnMore();
    } else {
      // Scroll down to footer / features section
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-amber-50/50 overflow-hidden">
      {/* Background decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100/60 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-100/40 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />

      {/* Navbar placeholder space */}
      <div className="h-16" />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center min-h-[calc(100vh-4rem)] gap-12 py-12">

          {/* Left: Text Content */}
          <div className="flex-1 max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 border border-amber-200 mb-6">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">AI-Powered Customization</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 text-gray-900">
              Design Your
              <span className="block text-amber-500">Perfect Pair</span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-gray-500 mb-8 leading-relaxed">
              Pakistan's first AI-powered shoe customization platform.
              Design, visualize, and order bespoke footwear crafted by
              local artisans.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={onStartDesigning}
                className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-6 text-base font-semibold rounded-xl shadow-lg shadow-amber-200"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Designing
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleLearnMore}
                className="px-8 py-6 text-base font-semibold rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Right: Shoe Image Card */}
          <div className="flex-1 relative flex justify-center items-center">
            <div className="relative w-full max-w-lg">
              <div className="rounded-3xl overflow-hidden shadow-2xl shadow-amber-100 border border-amber-100">
                <img
                  src="/images/hero-cover.jpg"
                  alt="Premium Pakistani Handcrafted Footwear"
                  className="w-full h-80 sm:h-96 object-cover"
                />
                {/* Logo overlay on image */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-xl px-3 py-2">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-white font-semibold text-sm italic">SoleMate AI</span>
                </div>
              </div>

              {/* Floating badge - bottom left only */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">AI Generated</p>
                  <p className="text-xs text-gray-500">See before you buy</p>
                </div>
              </div>

              {/* Decorative dot */}
              <div className="absolute top-1/2 -right-8 w-3 h-3 rounded-full bg-amber-400" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

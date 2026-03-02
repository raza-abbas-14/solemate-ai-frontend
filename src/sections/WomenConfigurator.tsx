// SoleMate AI - Women's Configurator v2.0
// Eastern vs Western categories with different materials and embellishments

import { useState, useCallback } from 'react';
import { ArrowLeft, Sparkles, Check, Gem, Sparkle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { DesignStore } from '@/hooks/useDesignStore';
import type { WomenCategory } from '@/types';
import {
  WOMEN_EASTERN_STYLES,
  WOMEN_WESTERN_STYLES,
  EASTERN_MATERIALS,
  WESTERN_MATERIALS,
  EASTERN_EMBELLISHMENTS,
  WESTERN_EMBELLISHMENTS,
  PAKISTANI_COLORS,
  WOMEN_SIZES,
  WOMEN_STEP_LABELS,
} from '@/data/shoeOptions';

interface WomenConfiguratorProps {
  designStore: DesignStore;
  onReviewOrder: () => void;
  onBack: () => void;
}

type WomenStep = 'category' | 'style' | 'material' | 'embellishment' | 'color' | 'size';
const STEPS: WomenStep[] = ['category', 'style', 'material', 'embellishment', 'color', 'size'];

export function WomenConfigurator({ designStore, onReviewOrder, onBack }: WomenConfiguratorProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = STEPS[currentStepIndex];
  const { womenConfig, isGenerating, generatedImage, generationProgress } = designStore;
  const isEastern = womenConfig.category === 'eastern';
  
  const goToNextStep = useCallback(() => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentStepIndex]);
  
  const goToPrevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);
  
  const isCurrentStepComplete = () => {
    switch (currentStep) {
      case 'category': return womenConfig.category !== null;
      case 'style': return womenConfig.style !== null;
      case 'material': return womenConfig.material !== null;
      case 'embellishment': return womenConfig.embellishment !== null;
      case 'color': return womenConfig.color !== null;
      case 'size': return womenConfig.size !== null;
      default: return false;
    }
  };
  
  const handleGenerate = async () => {
    if (!designStore.isConfigComplete()) return;

    designStore.startGenerating();

    try {
      const { generateImg2Img } = await import('@/services/aiService');
      const config = designStore.getConfiguration();
      if (!config) return;

      const configData = config.config as unknown as Record<string, string>;

      // Build prompt from selected options
      const materialMap: Record<string, string> = {
        'full-grain-leather': 'full-grain leather', 'premium-suede': 'premium suede',
        'patent-leather': 'glossy patent leather', 'nappa-leather': 'soft nappa leather',
        'canvas': 'canvas', 'genuine-leather': 'genuine leather',
        'luxury-velvet': 'luxury velvet', 'raw-silk': 'raw silk', 'brocade': 'brocade fabric',
      };
      const colorMap: Record<string, string> = {
        'classic-black': 'black', 'bridal-maroon': 'deep maroon', 'royal-blue': 'royal blue',
        'emerald-green': 'emerald green', 'champagne-gold': 'champagne gold',
        'ivory-white': 'ivory white', 'nude-beige': 'nude beige',
        'chocolate-brown': 'chocolate brown', 'navy-blue': 'navy blue', 'burgundy': 'burgundy',
      };
      const material = materialMap[configData?.material] || configData?.material || 'leather';
      const color = colorMap[configData?.color] || configData?.color || 'black';
      const prompt = `professional product photography of a premium handcrafted ${color} ${material} women's shoe, plain white background, studio lighting, photorealistic, 4k, high quality`;

      // Get skeleton image as blob
      const skeletonMap: Record<string, string> = {
        'khussa': '/images/skeletons/women/khussa-base.jpg',
        'pump': '/images/skeletons/women/pump-base.jpg',
        'block-heel': '/images/skeletons/women/block-heel-base.jpg',
        'stiletto': '/images/skeletons/women/stiletto-base.jpg',
        'kolhapuri': '/images/skeletons/women/khussa-base.jpg',
        'mules': '/images/skeletons/women/pump-base.jpg',
        'jutti': '/images/skeletons/women/khussa-base.jpg',
        'wedge': '/images/skeletons/women/block-heel-base.jpg',
      };
      const skeletonUrl = skeletonMap[configData?.style] || '/images/skeletons/women/khussa-base.jpg';

      designStore.updateProgress(20);
      const skeletonResponse = await fetch(skeletonUrl);
      const skeletonBlob = await skeletonResponse.blob();
      designStore.updateProgress(40);

      const result = await generateImg2Img({
        image: skeletonBlob,
        prompt,
        negativePrompt: 'blurry, distorted, low quality, deformed, cartoon, text, watermark, change shape, alter silhouette',
        strength: 0.65,
        steps: 30,
        cfgScale: 7,
      });

      designStore.updateProgress(95);

      if (result.artifacts && result.artifacts.length > 0) {
        const generatedImageUrl = `data:image/png;base64,${result.artifacts[0].base64}`;
        designStore.setGeneratedImage(generatedImageUrl);
      }

    } catch (error) {
      console.error('Generation failed:', error);
    }

    designStore.stopGenerating();
  };
  
  const getStyleOptions = () => {
    return isEastern ? WOMEN_EASTERN_STYLES : WOMEN_WESTERN_STYLES;
  };
  
  const getMaterialOptions = () => {
    return isEastern ? EASTERN_MATERIALS : WESTERN_MATERIALS;
  };
  
  const getEmbellishmentOptions = () => {
    return isEastern ? EASTERN_EMBELLISHMENTS : WESTERN_EMBELLISHMENTS;
  };
  
  const handleSelect = (value: string) => {
    switch (currentStep) {
      case 'category':
        designStore.updateWomenCategory(value as WomenCategory);
        setTimeout(goToNextStep, 300);
        break;
      case 'style':
        designStore.updateWomenStyle(value as any);
        setTimeout(goToNextStep, 300);
        break;
      case 'material':
        designStore.updateWomenMaterial(value as any);
        setTimeout(goToNextStep, 300);
        break;
      case 'embellishment':
        designStore.updateWomenEmbellishment(value as any);
        setTimeout(goToNextStep, 300);
        break;
      case 'color':
        designStore.updateWomenColor(value as any);
        setTimeout(goToNextStep, 300);
        break;
      case 'size':
        designStore.updateWomenSize(parseInt(value));
        break;
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between h-14 px-4">
          <button onClick={onBack} className="flex items-center text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">W</span>
            </div>
            <span className="font-semibold text-slate-900 hidden sm:block">Women&apos;s Collection</span>
          </div>
          
          <div className="text-sm text-slate-500">
            {currentStepIndex + 1}/{STEPS.length}
          </div>
        </div>
        
        <div className="h-1 bg-slate-100">
          <div 
            className="h-full bg-gradient-to-r from-rose-500 to-rose-400 transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </header>
      
      {/* Sticky Preview */}
      <div className="sticky top-[57px] z-30 bg-slate-50 border-b border-slate-200">
        <div className="p-4">
          <div className="aspect-square max-w-[280px] mx-auto bg-white rounded-2xl shadow-lg overflow-hidden relative">
            {womenConfig.category && (
              <div className="absolute top-3 right-3 z-10">
                <Badge className={`text-white ${
                  isEastern 
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500' 
                    : 'bg-gradient-to-r from-rose-500 to-rose-400'
                }`}>
                  {isEastern ? (
                    <><Gem className="w-3 h-3 mr-1" />Eastern</>
                  ) : (
                    <><Sparkle className="w-3 h-3 mr-1" />Western</>
                  )}
                </Badge>
              </div>
            )}
            
            {isGenerating ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin" />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-rose-500" />
                </div>
                <p className="text-sm font-medium text-slate-700">AI Generating...</p>
                <p className="text-xs text-slate-500">{generationProgress}%</p>
                <div className="w-32 h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500 to-rose-400 transition-all"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
              </div>
            ) : generatedImage ? (
              <img src={generatedImage} alt="Your design" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center mb-4">
                  <Sparkles className="w-10 h-10 text-rose-400" />
                </div>
                <p className="text-center text-sm text-slate-500">
                  Complete all steps to see your AI-generated preview
                </p>
              </div>
            )}
          </div>
          
          {designStore.isConfigComplete() && (
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              <Badge variant="outline" className={isEastern ? 'border-amber-500 text-amber-700' : 'border-rose-500 text-rose-700'}>
                {isEastern ? 'Eastern' : 'Western'}
              </Badge>
              {womenConfig.style && (
                <Badge variant="secondary" className="text-xs bg-slate-100">
                  {getStyleOptions().find(s => s.value === womenConfig.style)?.label}
                </Badge>
              )}
              {womenConfig.color && (
                <Badge variant="secondary" className="text-xs bg-slate-100">
                  {PAKISTANI_COLORS.find(c => c.value === womenConfig.color)?.label}
                </Badge>
              )}
              {womenConfig.size && (
                <Badge variant="secondary" className="text-xs bg-slate-100">
                  EU {womenConfig.size}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Options Section */}
      <div className="flex-1 p-4 pb-56">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {currentStep === 'category' ? 'Choose Your Style' : `Select ${WOMEN_STEP_LABELS[currentStepIndex]}`}
          </h2>
          <p className="text-sm text-slate-500">
            {currentStep === 'category' 
              ? 'Select Eastern traditional or Western modern styles' 
              : `Choose your ${WOMEN_STEP_LABELS[currentStepIndex].toLowerCase()}`}
          </p>
        </div>
        
        {/* Category Selection */}
        {currentStep === 'category' && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSelect('eastern')}
              className={`p-5 rounded-xl border-2 text-left transition-all ${
                isEastern 
                  ? 'border-amber-600 bg-amber-50 shadow-lg shadow-amber-500/10' 
                  : 'border-slate-200 hover:border-amber-400'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-3">
                <Gem className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900">Eastern</h3>
              <p className="text-xs text-slate-500 mt-1">Khussa, Jutti, Kolhapuri</p>
              <p className="text-xs text-amber-700 mt-2 font-medium">Traditional embellishments</p>
            </button>
            
            <button
              onClick={() => handleSelect('western')}
              className={`p-5 rounded-xl border-2 text-left transition-all ${
                !isEastern && womenConfig.category 
                  ? 'border-rose-500 bg-rose-50 shadow-lg shadow-rose-500/10' 
                  : 'border-slate-200 hover:border-rose-400'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center mb-3">
                <Sparkle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900">Western</h3>
              <p className="text-xs text-slate-500 mt-1">Pump, Block Heel, Mules</p>
              <p className="text-xs text-rose-700 mt-2 font-medium">Modern embellishments</p>
            </button>
          </div>
        )}
        
        {/* Style Selection */}
        {currentStep === 'style' && (
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
            {getStyleOptions().map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`flex-shrink-0 w-36 rounded-xl overflow-hidden border-2 transition-all relative ${
                  womenConfig.style === option.value
                    ? 'border-rose-500 shadow-lg shadow-rose-500/20'
                    : 'border-slate-200 hover:border-rose-400'
                }`}
              >
                <div className="aspect-square bg-slate-100">
                  <img src={option.image} alt={option.label} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 bg-white">
                  <p className="font-medium text-sm text-slate-900 truncate">{option.label}</p>
                  <p className="text-xs text-slate-500 truncate">{option.description}</p>
                </div>
                {womenConfig.style === option.value && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
        
        {/* Material Selection */}
        {currentStep === 'material' && (
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
            {getMaterialOptions().map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`flex-shrink-0 w-36 rounded-xl overflow-hidden border-2 transition-all relative ${
                  womenConfig.material === option.value
                    ? 'border-rose-500 shadow-lg shadow-rose-500/20'
                    : 'border-slate-200 hover:border-rose-400'
                }`}
              >
                <div className="aspect-square bg-slate-100">
                  <img src={option.image} alt={option.label} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 bg-white">
                  <p className="font-medium text-sm text-slate-900 truncate">{option.label}</p>
                  <p className="text-xs text-slate-500 truncate">{option.description}</p>
                  <p className="text-xs font-semibold mt-1 text-rose-700">
                    PKR {option.price.toLocaleString()}
                  </p>
                </div>
                {womenConfig.material === option.value && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
        
        {/* Embellishment Selection */}
        {currentStep === 'embellishment' && (
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
            {getEmbellishmentOptions().map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`flex-shrink-0 w-36 rounded-xl overflow-hidden border-2 transition-all relative ${
                  womenConfig.embellishment === option.value
                    ? 'border-rose-500 shadow-lg shadow-rose-500/20'
                    : 'border-slate-200 hover:border-rose-400'
                }`}
              >
                <div className="aspect-square bg-slate-100">
                  <img src={option.image} alt={option.label} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 bg-white">
                  <p className="font-medium text-sm text-slate-900 truncate">{option.label}</p>
                  <p className="text-xs text-slate-500 truncate">{option.description}</p>
                  <p className={`text-xs font-medium mt-1 ${option.price === 0 ? 'text-green-600' : 'text-rose-700'}`}>
                    {option.price === 0 ? 'Included' : `+PKR ${option.price.toLocaleString()}`}
                  </p>
                </div>
                {womenConfig.embellishment === option.value && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
        
        {/* Color Selection */}
        {currentStep === 'color' && (
          <div className="grid grid-cols-5 gap-3">
            {PAKISTANI_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => handleSelect(color.value)}
                className={`aspect-square rounded-xl border-2 transition-all ${
                  womenConfig.color === color.value
                    ? 'border-rose-500 scale-110 shadow-lg'
                    : 'border-slate-200 hover:border-rose-400'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.label}
              >
                {womenConfig.color === color.value && (
                  <Check className={`w-6 h-6 mx-auto ${
                    ['black', 'dark-brown', 'chocolate-brown', 'navy-blue', 'burgundy'].includes(color.value)
                      ? 'text-white'
                      : 'text-slate-800'
                  }`} />
                )}
              </button>
            ))}
          </div>
        )}
        
        {/* Size Selection */}
        {currentStep === 'size' && (
          <div className="grid grid-cols-4 gap-3">
            {WOMEN_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => handleSelect(size.toString())}
                className={`aspect-square rounded-xl font-semibold text-lg transition-all ${
                  womenConfig.size === size
                    ? 'bg-gradient-to-br from-rose-500 to-rose-400 text-white shadow-lg'
                    : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-rose-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}
        
        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {currentStepIndex > 0 && (
            <Button variant="outline" onClick={goToPrevStep} className="flex-1 border-slate-300">
              Previous
            </Button>
          )}
          {currentStepIndex < STEPS.length - 1 && (
            <Button
              onClick={goToNextStep}
              disabled={!isCurrentStepComplete()}
              className="flex-1 bg-gradient-to-r from-rose-500 to-rose-400 text-white disabled:opacity-50"
            >
              Next
            </Button>
          )}
        </div>
        
        {designStore.isConfigComplete() && !isGenerating && (
          <Button
            onClick={handleGenerate}
            className="w-full mt-4 py-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-lg font-semibold hover:from-purple-700 hover:to-indigo-700"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {generatedImage ? '🔄 Regenerate AI Preview' : '✨ Generate AI Preview'}
          </Button>
        )}
      </div>
      
      {/* Fixed Price Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-40 safe-area-pb">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Total Price</p>
            <p className="text-2xl font-bold text-slate-900">
              PKR {designStore.getCurrentPrice().toLocaleString()}
            </p>
          </div>
          
          <Button
            onClick={onReviewOrder}
            disabled={!designStore.isConfigComplete()}
            className="bg-gradient-to-r from-rose-500 to-rose-400 hover:from-rose-600 hover:to-rose-500 text-white px-6 disabled:opacity-50"
          >
            Review & Order
            <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
}

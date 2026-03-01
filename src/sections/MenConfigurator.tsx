// SoleMate AI - Men's Configurator v2.0
// Mobile-first with sticky preview, conditional logic for Chelsea/Loro Piana

import { useState, useCallback } from 'react';
import { ArrowLeft, Sparkles, Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { DesignStore } from '@/hooks/useDesignStore';
import {
  MEN_STYLE_OPTIONS,
  MEN_SOLE_OPTIONS,
  MEN_SIZES,
  MEN_STEP_LABELS,
  PAKISTANI_COLORS,
  getStyleNote,
  requiresPlainDesign,
  isLoroPiana,
} from '@/data/shoeOptions';

interface MenConfiguratorProps {
  designStore: DesignStore;
  onReviewOrder: () => void;
  onBack: () => void;
}

type MenStep = 'style' | 'material' | 'sole' | 'detail' | 'color' | 'size';
const STEPS: MenStep[] = ['style', 'material', 'sole', 'detail', 'color', 'size'];

export function MenConfigurator({ designStore, onReviewOrder, onBack }: MenConfiguratorProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = STEPS[currentStepIndex];
  const { menConfig, isGenerating, generatedImage, generationProgress } = designStore;
  
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
      case 'style': return menConfig.style !== null;
      case 'material': return menConfig.material !== null;
      case 'sole': return menConfig.soleType !== null;
      case 'detail': return menConfig.detail !== null;
      case 'color': return menConfig.color !== null;
      case 'size': return menConfig.size !== null;
      default: return false;
    }
  };
  
  const handleGenerate = async () => {
    if (!designStore.isConfigComplete()) return;
    
    designStore.startGenerating();
    
    try {
      const { generateShoeImage } = await import('@/services/aiService');
      const config = designStore.getConfiguration();
      if (!config) return;
      
      const result = await generateShoeImage(config, (progress) => {
        designStore.updateProgress(progress);
      });
      
      if (result.imageUrl) {
        designStore.setGeneratedImage(result.imageUrl);
      }
    } catch (error) {
      console.error('Generation failed:', error);
    }
    
    designStore.stopGenerating();
  };
  
  // Get available options based on current style selection
  const getMaterialOptions = () => {
    if (menConfig.style && isLoroPiana(menConfig.style)) {
      // Loro Piana uses special suede-only materials
      return designStore.getAvailableMaterials();
    }
    return designStore.getAvailableMaterials();
  };
  
  const getDetailOptions = () => {
    return designStore.getAvailableDetails();
  };
  
  const getStepOptions = () => {
    switch (currentStep) {
      case 'style': return MEN_STYLE_OPTIONS;
      case 'material': return getMaterialOptions();
      case 'sole': return MEN_SOLE_OPTIONS;
      case 'detail': return getDetailOptions();
      default: return [];
    }
  };
  
  const getSelectedValue = () => {
    switch (currentStep) {
      case 'style': return menConfig.style;
      case 'material': return menConfig.material;
      case 'sole': return menConfig.soleType;
      case 'detail': return menConfig.detail;
      case 'color': return menConfig.color;
      case 'size': return menConfig.size?.toString() || null;
      default: return null;
    }
  };
  
  const handleSelect = (value: string) => {
    // Reset generated image whenever customer changes anything
    designStore.setGeneratedImage('');
    switch (currentStep) {
      case 'style':
        designStore.updateMenStyle(value as any);
        setTimeout(goToNextStep, 300);
        break;
      case 'material':
        designStore.updateMenMaterial(value as any);
        setTimeout(goToNextStep, 300);
        break;
      case 'sole':
        designStore.updateMenSole(value as any);
        setTimeout(goToNextStep, 300);
        break;
      case 'detail':
        designStore.updateMenDetail(value as any);
        setTimeout(goToNextStep, 300);
        break;
      case 'color':
        designStore.updateMenColor(value as any);
        setTimeout(goToNextStep, 300);
        break;
      case 'size':
        designStore.updateMenSize(parseInt(value));
        break;
    }
  };

  // Get style note if applicable
  const styleNote = menConfig.style ? getStyleNote(menConfig.style) : null;
  const isPlainOnly = menConfig.style ? requiresPlainDesign(menConfig.style) : false;
  
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <span className="font-semibold text-slate-900 hidden sm:block">Men&apos;s Collection</span>
          </div>
          
          <div className="text-sm text-slate-500">
            {currentStepIndex + 1}/{STEPS.length}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 bg-slate-100">
          <div 
            className="h-full bg-gradient-to-r from-amber-600 to-amber-500 transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </header>
      
      {/* Sticky Preview Section - Mobile Optimized */}
      <div className="sticky top-[57px] z-30 bg-slate-50 border-b border-slate-200">
        <div className="p-4">
          <div className="aspect-square max-w-[280px] mx-auto bg-white rounded-2xl shadow-lg overflow-hidden relative">
            {isGenerating ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin" />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-amber-600" />
                </div>
                <p className="text-sm font-medium text-slate-700">AI Generating...</p>
                <p className="text-xs text-slate-500">{generationProgress}%</p>
                <div className="w-32 h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-500 transition-all"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
              </div>
            ) : generatedImage ? (
              <img src={generatedImage} alt="Your design" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4">
                  <Sparkles className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-center text-sm text-slate-500">
                  Complete all steps to see your AI-generated preview
                </p>
              </div>
            )}
          </div>
          
          {/* Style Note Alert */}
          {styleNote && (
            <Alert className="mt-3 max-w-[280px] mx-auto bg-amber-50 border-amber-200">
              <Info className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-xs text-amber-800">
                {styleNote}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Design Summary */}
          {designStore.isConfigComplete() && (
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              {menConfig.style && (
                <Badge variant="secondary" className="text-xs bg-slate-100">
                  {MEN_STYLE_OPTIONS.find(s => s.value === menConfig.style)?.label}
                </Badge>
              )}
              {menConfig.material && (
                <Badge variant="secondary" className="text-xs bg-slate-100">
                  {designStore.getAvailableMaterials().find(m => m.value === menConfig.material)?.label}
                </Badge>
              )}
              {menConfig.color && (
                <Badge variant="secondary" className="text-xs bg-slate-100">
                  {PAKISTANI_COLORS.find(c => c.value === menConfig.color)?.label}
                </Badge>
              )}
              {menConfig.size && (
                <Badge variant="secondary" className="text-xs bg-slate-100">
                  EU {menConfig.size}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Options Section */}
      <div className="flex-1 p-4 pb-40">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Select {MEN_STEP_LABELS[currentStepIndex]}
          </h2>
          <p className="text-sm text-slate-500">
            Choose your {MEN_STEP_LABELS[currentStepIndex].toLowerCase()} from the options below
          </p>
          {isPlainOnly && currentStep === 'detail' && (
            <p className="text-xs text-amber-600 mt-1">
              This style requires plain design only
            </p>
          )}
        </div>
        
        {/* Horizontal Scrolling Options */}
        {currentStep !== 'color' && currentStep !== 'size' && (
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
            {getStepOptions().map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`flex-shrink-0 w-36 rounded-xl overflow-hidden border-2 transition-all relative ${
                  getSelectedValue() === option.value
                    ? 'border-amber-600 shadow-lg shadow-amber-500/20'
                    : 'border-slate-200 hover:border-amber-400'
                }`}
              >
                <div className="aspect-square bg-slate-100">
                  <img 
                    src={option.image} 
                    alt={option.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 bg-white">
                  <p className="font-medium text-sm text-slate-900 truncate">{option.label}</p>
                  <p className="text-xs text-slate-500 truncate">{option.description}</p>
                  {/* Material-based pricing display */}
                  {currentStep === 'material' && (
                    <p className="text-xs font-semibold mt-1 text-amber-700">
                      PKR {option.price.toLocaleString()}
                    </p>
                  )}
                  {/* Add-on pricing for sole/detail */}
                  {(currentStep === 'sole' || currentStep === 'detail') && (
                    <p className={`text-xs font-medium mt-1 ${
                      option.price === 0 ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {option.price === 0 ? 'Included' : `+PKR ${option.price.toLocaleString()}`}
                    </p>
                  )}
                </div>
                {getSelectedValue() === option.value && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center">
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
                  menConfig.color === color.value
                    ? 'border-amber-600 scale-110 shadow-lg'
                    : 'border-slate-200 hover:border-amber-400'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.label}
              >
                {menConfig.color === color.value && (
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
            {MEN_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => handleSelect(size.toString())}
                className={`aspect-square rounded-xl font-semibold text-lg transition-all ${
                  menConfig.size === size
                    ? 'bg-gradient-to-br from-amber-600 to-amber-500 text-white shadow-lg'
                    : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-amber-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}
        
        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6">
          {currentStepIndex > 0 && (
            <Button
              variant="outline"
              onClick={goToPrevStep}
              className="flex-1 border-slate-300"
            >
              Previous
            </Button>
          )}
          
          {currentStepIndex < STEPS.length - 1 && (
            <Button
              onClick={goToNextStep}
              disabled={!isCurrentStepComplete()}
              className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 text-white disabled:opacity-50"
            >
              Next
            </Button>
          )}
        </div>
        
        {/* Generate Preview Button */}
        {designStore.isConfigComplete() && !generatedImage && !isGenerating && (
          <Button
            onClick={handleGenerate}
            className="w-full mt-4 py-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-lg font-semibold hover:from-purple-700 hover:to-indigo-700"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Generate AI Preview
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
            className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white px-6 disabled:opacity-50"
          >
            Review & Order
            <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
}

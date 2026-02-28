// SoleMate AI - Design Store Hook v2.0
// Central state management for shoe configuration
// Updated: Material-based pricing, Eastern/Western categories

import { useState, useCallback } from 'react';
import type { 
  Gender, 
  WomenCategory,
  MenConfiguration, 
  WomenConfiguration,
  MenStyle,
  MenMaterial,
  MenSoleType,
  MenDetail,
  WomenStyle,
  EasternMaterial,
  WesternMaterial,
  EasternEmbellishment,
  WesternEmbellishment,
  PakistaniColor,
  ShoeConfiguration
} from '@/types';
import { 
  calculateMenPrice, 
  calculateLoroPianaPrice,
  calculateEasternPrice,
  calculateWesternPrice,
  requiresPlainDesign,
  isLoroPiana,
  getMaterialsForStyle,
  getDetailsForStyle
} from '@/data/shoeOptions';

const initialMenConfig: MenConfiguration = {
  style: null,
  material: null,
  soleType: null,
  detail: null,
  color: null,
  size: null,
};

const initialWomenConfig: WomenConfiguration = {
  category: null,
  style: null,
  material: null,
  embellishment: null,
  color: null,
  size: null,
};

export type DesignStore = ReturnType<typeof useDesignStore>;

export function useDesignStore() {
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [menConfig, setMenConfig] = useState<MenConfiguration>(initialMenConfig);
  const [womenConfig, setWomenConfig] = useState<WomenConfiguration>(initialWomenConfig);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);

  const setGender = useCallback((gender: Gender) => {
    setSelectedGender(gender);
    setGeneratedImage(null);
    setGenerationProgress(0);
  }, []);

  // Men's updaters with conditional logic
  const updateMenStyle = useCallback((style: MenStyle) => {
    setMenConfig(prev => {
      const newConfig = { ...prev, style };
      
      // If Chelsea Boot or Loro Piana, force plain detail
      if (requiresPlainDesign(style)) {
        newConfig.detail = 'plain';
      }
      
      // If Loro Piana, reset material to null (suede-only options)
      if (isLoroPiana(style)) {
        newConfig.material = null;
      }
      
      return newConfig;
    });
    setGeneratedImage(null);
  }, []);

  const updateMenMaterial = useCallback((material: MenMaterial) => {
    setMenConfig(prev => ({ ...prev, material }));
    setGeneratedImage(null);
  }, []);

  const updateMenSole = useCallback((soleType: MenSoleType) => {
    setMenConfig(prev => ({ ...prev, soleType }));
    setGeneratedImage(null);
  }, []);

  const updateMenDetail = useCallback((detail: MenDetail) => {
    // Prevent changing detail for plain-only styles
    if (menConfig.style && requiresPlainDesign(menConfig.style) && detail !== 'plain') {
      return;
    }
    setMenConfig(prev => ({ ...prev, detail }));
    setGeneratedImage(null);
  }, [menConfig.style]);

  const updateMenColor = useCallback((color: PakistaniColor) => {
    setMenConfig(prev => ({ ...prev, color }));
    setGeneratedImage(null);
  }, []);

  const updateMenSize = useCallback((size: number) => {
    setMenConfig(prev => ({ ...prev, size }));
  }, []);

  // Women's updaters - Eastern vs Western
  const updateWomenCategory = useCallback((category: WomenCategory) => {
    setWomenConfig(prev => ({ 
      ...prev, 
      category,
      style: null,
      material: null,
      embellishment: null,
    }));
    setGeneratedImage(null);
  }, []);

  const updateWomenStyle = useCallback((style: WomenStyle) => {
    setWomenConfig(prev => ({ 
      ...prev, 
      style,
      material: null,
      embellishment: null,
    }));
    setGeneratedImage(null);
  }, []);

  const updateWomenMaterial = useCallback((material: EasternMaterial | WesternMaterial) => {
    setWomenConfig(prev => ({ ...prev, material }));
    setGeneratedImage(null);
  }, []);

  const updateWomenEmbellishment = useCallback((embellishment: EasternEmbellishment | WesternEmbellishment) => {
    setWomenConfig(prev => ({ ...prev, embellishment }));
    setGeneratedImage(null);
  }, []);

  const updateWomenColor = useCallback((color: PakistaniColor) => {
    setWomenConfig(prev => ({ ...prev, color }));
    setGeneratedImage(null);
  }, []);

  const updateWomenSize = useCallback((size: number) => {
    setWomenConfig(prev => ({ ...prev, size }));
  }, []);

  // AI generation
  const startGenerating = useCallback(() => {
    setIsGenerating(true);
    setGenerationProgress(0);
  }, []);

  const stopGenerating = useCallback(() => {
    setIsGenerating(false);
  }, []);

  const updateProgress = useCallback((progress: number) => {
    setGenerationProgress(progress);
  }, []);

  // Price calculation with new structure
  const getCurrentPrice = useCallback((): number => {
    if (selectedGender === 'men' && menConfig.style && menConfig.material && menConfig.soleType && menConfig.detail) {
      // Loro Piana uses special pricing
      if (isLoroPiana(menConfig.style)) {
        return calculateLoroPianaPrice({
          material: menConfig.material,
          soleType: menConfig.soleType,
        });
      }
      
      return calculateMenPrice({
        style: menConfig.style,
        material: menConfig.material,
        soleType: menConfig.soleType,
        detail: menConfig.detail,
      });
    }
    
    if (selectedGender === 'women' && womenConfig.category && womenConfig.style && womenConfig.material && womenConfig.embellishment) {
      if (womenConfig.category === 'eastern') {
        return calculateEasternPrice({
          style: womenConfig.style,
          material: womenConfig.material as EasternMaterial,
          embellishment: womenConfig.embellishment as EasternEmbellishment,
        });
      } else {
        return calculateWesternPrice({
          style: womenConfig.style,
          material: womenConfig.material as WesternMaterial,
          embellishment: womenConfig.embellishment as WesternEmbellishment,
        });
      }
    }
    
    return 0;
  }, [selectedGender, menConfig, womenConfig]);

  // Configuration completion checks
  const isMenConfigComplete = useCallback((): boolean => {
    return (
      menConfig.style !== null &&
      menConfig.material !== null &&
      menConfig.soleType !== null &&
      menConfig.detail !== null &&
      menConfig.color !== null &&
      menConfig.size !== null
    );
  }, [menConfig]);

  const isWomenConfigComplete = useCallback((): boolean => {
    return (
      womenConfig.category !== null &&
      womenConfig.style !== null &&
      womenConfig.material !== null &&
      womenConfig.embellishment !== null &&
      womenConfig.color !== null &&
      womenConfig.size !== null
    );
  }, [womenConfig]);

  const isConfigComplete = useCallback((): boolean => {
    if (selectedGender === 'men') return isMenConfigComplete();
    if (selectedGender === 'women') return isWomenConfigComplete();
    return false;
  }, [selectedGender, isMenConfigComplete, isWomenConfigComplete]);

  // Get full configuration
  const getConfiguration = useCallback((): ShoeConfiguration | null => {
    if (!selectedGender) return null;
    
    if (selectedGender === 'men') {
      return { gender: 'men', config: menConfig };
    }
    
    return { gender: 'women', config: womenConfig };
  }, [selectedGender, menConfig, womenConfig]);

  // Get available options based on current selection
  const getAvailableMaterials = useCallback(() => {
    if (selectedGender === 'men' && menConfig.style) {
      return getMaterialsForStyle(menConfig.style);
    }
    return [];
  }, [selectedGender, menConfig.style]);

  const getAvailableDetails = useCallback(() => {
    if (selectedGender === 'men' && menConfig.style) {
      return getDetailsForStyle(menConfig.style);
    }
    return [];
  }, [selectedGender, menConfig.style]);

  const isPlainOnly = useCallback((): boolean => {
    return menConfig.style ? requiresPlainDesign(menConfig.style) : false;
  }, [menConfig.style]);

  // Reset functions
  const resetConfig = useCallback(() => {
    if (selectedGender === 'men') {
      setMenConfig(initialMenConfig);
    } else {
      setWomenConfig(initialWomenConfig);
    }
    setGeneratedImage(null);
    setGenerationProgress(0);
  }, [selectedGender]);

  const resetAll = useCallback(() => {
    setSelectedGender(null);
    setMenConfig(initialMenConfig);
    setWomenConfig(initialWomenConfig);
    setGeneratedImage(null);
    setIsGenerating(false);
    setGenerationProgress(0);
  }, []);

  return {
    selectedGender,
    setGender,
    menConfig,
    womenConfig,
    updateMenStyle,
    updateMenMaterial,
    updateMenSole,
    updateMenDetail,
    updateMenColor,
    updateMenSize,
    updateWomenCategory,
    updateWomenStyle,
    updateWomenMaterial,
    updateWomenEmbellishment,
    updateWomenColor,
    updateWomenSize,
    isGenerating,
    generatedImage,
    generationProgress,
    setGeneratedImage,
    startGenerating,
    stopGenerating,
    updateProgress,
    getCurrentPrice,
    isMenConfigComplete,
    isWomenConfigComplete,
    isConfigComplete,
    getConfiguration,
    getAvailableMaterials,
    getAvailableDetails,
    isPlainOnly,
    resetConfig,
    resetAll,
  };
}

// SoleMate AI - Img2Img Generation Service
// Image-to-Image AI using Stability AI API

import type { ShoeConfiguration } from '@/types';

// Stability AI Configuration
const STABILITY_API_KEY = import.meta.env.VITE_STABILITY_API_KEY || '';
const STABILITY_API_URL = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image';

// Skeleton images for each style
const SKELETON_IMAGES = {
  men: {
    'penny-loafer': '/images/styles/men-penny-loafer.jpg',
    'chunky-loafer': '/images/styles/men-chunky-loafer.jpg',
    'oxford': '/images/styles/men-oxford.jpg',
    'double-monk': '/images/styles/men-double-monk.jpg',
    'chelsea-boot': '/images/styles/men-chelsea.jpg',
    'wingtip-brogue': '/images/styles/men-brogue.jpg',
    'peshawari-chappal': '/images/styles/men-peshawari.jpg',
    'tassel-loafer': '/images/styles/men-tassel.jpg',
  },
  women: {
    'khussa': '/images/styles/women-khussa.jpg',
    'pump': '/images/styles/women-pump.jpg',
    'block-heel': '/images/styles/women-block-heel.jpg',
    'kolhapuri': '/images/styles/women-kolhapuri.jpg',
    'mules': '/images/styles/women-mules.jpg',
    'jutti': '/images/styles/women-jutti.jpg',
    'wedge': '/images/styles/women-wedge.jpg',
    'stiletto': '/images/styles/women-stiletto.jpg',
  },
};

// Build prompt from configuration
function buildPrompt(config: ShoeConfiguration): string {
  const materialNames: Record<string, string> = {
    'full-grain-leather': 'full-grain leather',
    'premium-suede': 'premium suede',
    'patent-leather': 'patent leather',
    'nappa-leather': 'nappa leather',
    'buffalo-leather': 'buffalo leather',
    'canvas': 'canvas',
    'synthetic-leather': 'synthetic leather',
    'genuine-leather': 'genuine leather',
    'luxury-velvet': 'luxury velvet',
    'raw-silk': 'raw silk',
    'brocade': 'brocade fabric',
  };
  
  const colorNames: Record<string, string> = {
    'classic-black': 'classic black',
    'bridal-maroon': 'bridal maroon',
    'royal-blue': 'royal blue',
    'emerald-green': 'emerald green',
    'champagne-gold': 'champagne gold',
    'ivory-white': 'ivory white',
    'nude-beige': 'nude beige',
    'chocolate-brown': 'chocolate brown',
    'navy-blue': 'navy blue',
    'burgundy': 'burgundy',
  };
  
  const configData = config.config as any;
  const material = materialNames[configData.material] || configData.material;
  const color = colorNames[configData.color] || configData.color;
  const gender = config.gender;
  
  return `Professional product photography of ${gender}'s shoe made of ${material} in ${color} color. Plain white background, studio lighting, high-end fashion catalog style, sharp focus, photorealistic, commercial product shot, 4K quality.`;
}

// Build negative prompt to prevent impossible designs
function buildNegativePrompt(): string {
  return 'change shape, alter silhouette, 3D render, impossible physics, floating elements, morphing, extra straps, deformed sole, digital art, cartoon, illustration, blurry, low quality, distorted, ugly, deformed, unrealistic proportions, multiple shoes, background objects, text, watermark, logo';
}

// Get skeleton image URL based on configuration
function getSkeletonImage(config: ShoeConfiguration): string {
  const configData = config.config as any;
  const style = configData.style;
  const gender = config.gender;
  
  if (gender === 'men') {
    return (SKELETON_IMAGES.men as Record<string, string>)[style] || SKELETON_IMAGES.men['penny-loafer'];
  }
  return (SKELETON_IMAGES.women as Record<string, string>)[style] || SKELETON_IMAGES.women['khussa'];
}

// Convert image URL to base64
async function imageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
}

// Generate image using Stability AI Img2Img
export async function generateShoeImage(
  config: ShoeConfiguration,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  // Check if API key is configured
  if (!STABILITY_API_KEY) {
    console.warn('Stability API key not configured. Using mock generation.');
    // Simulate generation delay
    for (let i = 0; i <= 100; i += 10) {
      onProgress?.(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return {
      success: true,
      imageUrl: getSkeletonImage(config),
    };
  }
  
  try {
    onProgress?.(10);
    
    const prompt = buildPrompt(config);
    const negativePrompt = buildNegativePrompt();
    const skeletonImageUrl = getSkeletonImage(config);
    
    onProgress?.(20);
    
    // Convert skeleton image to base64
    const initImage = await imageUrlToBase64(skeletonImageUrl);
    
    onProgress?.(40);
    
    // Prepare request body
    const requestBody = {
      text_prompts: [
        { text: prompt, weight: 1.0 },
        { text: negativePrompt, weight: -1.0 },
      ],
      init_image: initImage,
      image_strength: 0.5,
      cfg_scale: 7,
      samples: 1,
      steps: 30,
      width: 1024,
      height: 1024,
    };
    
    onProgress?.(60);
    
    // Call Stability AI API
    const response = await fetch(STABILITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${STABILITY_API_KEY}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    onProgress?.(80);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate image');
    }
    
    const data = await response.json();
    
    onProgress?.(90);
    
    // Extract image from response
    if (data.artifacts && data.artifacts.length > 0) {
      const imageBase64 = data.artifacts[0].base64;
      const imageUrl = `data:image/png;base64,${imageBase64}`;
      
      onProgress?.(100);
      
      return {
        success: true,
        imageUrl,
      };
    }
    
    throw new Error('No image generated');
    
  } catch (error) {
    console.error('Error generating shoe image:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      imageUrl: getSkeletonImage(config),
    };
  }
}

// Mock generation for development/testing
export async function mockGenerateShoeImage(
  config: ShoeConfiguration,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  // Simulate generation progress
  for (let i = 0; i <= 100; i += 5) {
    onProgress?.(i);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return {
    success: true,
    imageUrl: getSkeletonImage(config),
  };
}

export { buildPrompt, buildNegativePrompt, getSkeletonImage, SKELETON_IMAGES };

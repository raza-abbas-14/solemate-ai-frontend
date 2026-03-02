// @ts-ignore
import { generateAsync } from 'stability-client';
import type { ShoeConfiguration } from '@/types';

// Pull the key directly from Vite environment variables as documented
const STABILITY_API_KEY = import.meta.env.VITE_STABILITY_API_KEY;

// Your actual local skeleton image paths
const SKELETON_IMAGES: Record<string, Record<string, string>> = {
  men: {
    'penny-loafer':   '/images/skeletons/men/classic-penny-base.jpg',
    'chunky-loafer':  '/images/skeletons/men/chunky-loafer-base.jpg',
    'oxford':         '/images/skeletons/men/oxford-base.jpg',
    'double-monk':    '/images/skeletons/men/oxford-base.jpg',
    'chelsea-boot':   '/images/skeletons/men/oxford-base.jpg',
    'wingtip-brogue': '/images/skeletons/men/oxford-base.jpg',
    'tassel-loafer':  '/images/skeletons/men/classic-penny-base.jpg',
    'suede-slip-on':  '/images/skeletons/men/suede-slipon-base.jpg',
  },
  women: {
    'khussa':     '/images/skeletons/women/khussa-base.jpg',
    'pump':       '/images/skeletons/women/pump-base.jpg',
    'block-heel': '/images/skeletons/women/block-heel-base.jpg',
    'stiletto':   '/images/skeletons/women/stiletto-base.jpg',
    'kolhapuri':  '/images/skeletons/women/khussa-base.jpg',
    'mules':      '/images/skeletons/women/pump-base.jpg',
    'jutti':      '/images/skeletons/women/khussa-base.jpg',
    'wedge':      '/images/skeletons/women/block-heel-base.jpg',
  },
};

// Official negative prompt from AI_Integration_Guide.pdf Page 2
const NEGATIVE_PROMPT = 'change shape, alter silhouette, 3D render, impossible physics, floating elements, morphing, extra straps, deformed sole, digital art, cartoon, illustration, blurry, low quality, distorted, ugly, deformed, unrealistic proportions, multiple shoes, background objects, text, watermark, logo';

export function getSkeletonImage(config: ShoeConfiguration): string {
  const configData = config.config as unknown as Record<string, string>;
  const style = configData?.style || '';
  const gender = config.gender;
  const images = gender === 'men' ? SKELETON_IMAGES.men : SKELETON_IMAGES.women;
  return images[style] || (gender === 'men'
    ? '/images/skeletons/men/oxford-base.jpg'
    : '/images/skeletons/women/khussa-base.jpg');
}

// Convert image URL to base64 for Img2Img input (from Guide Page 2)
async function imageToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function buildPrompt(config: ShoeConfiguration): string {
  const configData = config.config as unknown as Record<string, string>;
  const gender = config.gender;
  const style = (configData?.style || 'shoe').replace(/-/g, ' ');
  const material = (configData?.material || 'leather').replace(/-/g, ' ');
  const color = (configData?.color || 'black').replace(/-/g, ' ');

  // Official prompt structure from AI_Setup_Guide.pdf Page 3
  return `Professional product photography of ${gender}'s ${style} made of ${material} in ${color} color. Plain white background, studio lighting, high-end fashion catalog style, sharp focus, photorealistic, commercial product shot, 4K quality.`;
}

export async function generateShoeImage(
  config: ShoeConfiguration,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  const skeletonUrl = getSkeletonImage(config);

  try {
    if (!STABILITY_API_KEY) throw new Error("Missing STABILITY_API_KEY in environment");

    onProgress?.(10);
    const initImage = await imageToBase64(skeletonUrl);
    
    onProgress?.(30);
    const prompt = buildPrompt(config);

    onProgress?.(50);
    // Exact API call parameters from AI_Integration_Guide.pdf Page 3
    const result = await generateAsync({
      prompt: prompt,
      negativePrompt: NEGATIVE_PROMPT,
      initImage: initImage,
      apiKey: STABILITY_API_KEY,
      width: 1024,
      height: 1024,
      steps: 30,
      cfgScale: 7,
      samples: 1,
      imageStrength: 0.5, // Critical: Preserves shape while applying textures
    });

    onProgress?.(80);

    if (result.images && result.images.length > 0) {
      onProgress?.(100);
      return { success: true, imageUrl: `data:image/png;base64,${result.images[0]}` };
    }

    throw new Error('Image generation failed to return data.');

  } catch (error) {
    console.error('AI Error:', error);
    return { success: false, imageUrl: skeletonUrl, error: String(error) };
  }
}
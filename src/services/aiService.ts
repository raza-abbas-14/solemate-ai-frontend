// @ts-ignore
import { generateAsync } from 'stability-client';
import type { ShoeConfiguration } from '@/types';

// The ONLY way to access keys in a Vite project on Vercel
const STABILITY_API_KEY = import.meta.env.VITE_STABILITY_API_KEY;

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

const NEGATIVE_PROMPT = 'change shape, alter silhouette, 3D render, impossible physics, floating elements, morphing, extra straps, deformed sole, digital art, cartoon, illustration, blurry, low quality, distorted, ugly, deformed, unrealistic proportions, multiple shoes, background objects, text, watermark, logo';

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

export async function generateShoeImage(
  config: ShoeConfiguration,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    if (!STABILITY_API_KEY) throw new Error("Missing API Key");

    const configData = config.config as any;
    const style = configData?.style || '';
    const skeletonUrl = SKELETON_IMAGES[config.gender]?.[style] || SKELETON_IMAGES.men.oxford;

    onProgress?.(10);
    const initImage = await imageToBase64(skeletonUrl);
    
    onProgress?.(40);
    const prompt = `Professional product photo of ${config.gender}'s ${style.replace(/-/g, ' ')} shoe, ${configData.material?.replace(/-/g, ' ')} material, ${configData.color?.replace(/-/g, ' ')} color, white background, studio lighting, photorealistic.`;

    // Force TypeScript to ignore errors by using 'as any'
    const result: any = await (generateAsync as any)({
      prompt,
      negativePrompt: NEGATIVE_PROMPT,
      initImage,
      apiKey: STABILITY_API_KEY,
      width: 1024,
      height: 1024,
      steps: 30,
      cfgScale: 7,
      samples: 1,
      imageStrength: 0.5,
    });

    if (result.images && result.images.length > 0) {
      onProgress?.(100);
      return { success: true, imageUrl: `data:image/png;base64,${result.images[0]}` };
    }
    throw new Error('No image returned');
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
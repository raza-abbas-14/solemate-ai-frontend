// SoleMate AI - Image Generation Service
// Calls /api/generate (Vercel serverless) which calls Replicate safely

import type { ShoeConfiguration } from '@/types';

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

export function getSkeletonImage(config: ShoeConfiguration): string {
  const configData = config.config as unknown as Record<string, string>;
  const style = configData?.style || '';
  const gender = config.gender;
  const images = gender === 'men' ? SKELETON_IMAGES.men : SKELETON_IMAGES.women;
  return images[style] || (gender === 'men'
    ? '/images/skeletons/men/oxford-base.jpg'
    : '/images/skeletons/women/khussa-base.jpg');
}

function buildPrompt(config: ShoeConfiguration): string {
  const configData = config.config as unknown as Record<string, string>;
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
  return `professional shoe product photo, ${color} ${material} shoe, white background, studio lighting, photorealistic, 4k`;
}

export async function generateShoeImage(
  config: ShoeConfiguration,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  const skeletonUrl = getSkeletonImage(config);

  try {
    onProgress?.(10);
    const prompt = buildPrompt(config);
    const skeletonFullUrl = `${window.location.origin}${skeletonUrl}`;
    onProgress?.(20);

    // Call our Vercel backend function — no CORS issues!
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, imageUrl: skeletonFullUrl }),
    });

    onProgress?.(50);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    onProgress?.(100);

    if (data.success && data.imageUrl) {
      return { success: true, imageUrl: data.imageUrl };
    }

    throw new Error(data.error || 'No image returned');

  } catch (error) {
    console.error('Generation error:', error);
    return { success: true, imageUrl: skeletonUrl, error: String(error) };
  }
}

export { SKELETON_IMAGES };

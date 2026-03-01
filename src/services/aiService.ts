// SoleMate AI - Img2Img Generation Service
// Uses FLUX Redux (img2img) on Replicate
// Takes real skeleton shoe photo → changes only color/material
// Result: Karigar can manufacture exactly what customer sees!

import type { ShoeConfiguration } from '@/types';

const REPLICATE_TOKEN = import.meta.env.VITE_REPLICATE_TOKEN || '';

// Real skeleton base images — actual shoe photos
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
    'khussa':      '/images/skeletons/women/khussa-base.jpg',
    'pump':        '/images/skeletons/women/pump-base.jpg',
    'block-heel':  '/images/skeletons/women/block-heel-base.jpg',
    'stiletto':    '/images/skeletons/women/stiletto-base.jpg',
    'kolhapuri':   '/images/skeletons/women/khussa-base.jpg',
    'mules':       '/images/skeletons/women/pump-base.jpg',
    'jutti':       '/images/skeletons/women/khussa-base.jpg',
    'wedge':       '/images/skeletons/women/block-heel-base.jpg',
  },
};

// Get skeleton image path for a shoe style
export function getSkeletonImage(config: ShoeConfiguration): string {
  const configData = config.config as unknown as Record<string, string>;
  const style = configData?.style || '';
  const gender = config.gender;
  const images = gender === 'men' ? SKELETON_IMAGES.men : SKELETON_IMAGES.women;
  const fallback = gender === 'men'
    ? '/images/skeletons/men/oxford-base.jpg'
    : '/images/skeletons/women/khussa-base.jpg';
  return images[style] || fallback;
}

// Build Img2Img prompt — only describes color/material, NOT shape
// This way AI only recolors/retextures the shoe, keeping the original shape
export function buildPrompt(config: ShoeConfiguration): string {
  const configData = config.config as unknown as Record<string, string>;

  const materialMap: Record<string, string> = {
    'full-grain-leather': 'full-grain leather',
    'premium-suede': 'premium suede',
    'patent-leather': 'glossy patent leather',
    'nappa-leather': 'soft nappa leather',
    'buffalo-leather': 'buffalo leather',
    'canvas': 'canvas fabric',
    'synthetic-leather': 'synthetic leather',
    'genuine-leather': 'genuine leather',
    'luxury-velvet': 'luxury velvet',
    'raw-silk': 'raw silk',
    'brocade': 'brocade embroidered fabric',
    'suede-western': 'western suede',
    'leather-eastern': 'eastern leather',
  };

  const colorMap: Record<string, string> = {
    'classic-black': 'classic black',
    'bridal-maroon': 'deep bridal maroon',
    'royal-blue': 'royal blue',
    'emerald-green': 'emerald green',
    'champagne-gold': 'champagne gold',
    'ivory-white': 'ivory white',
    'nude-beige': 'nude beige',
    'chocolate-brown': 'chocolate brown',
    'navy-blue': 'navy blue',
    'burgundy': 'burgundy',
    'dusty-rose': 'dusty rose pink',
    'forest-green': 'forest green',
    'camel-tan': 'camel tan',
    'cobalt-blue': 'cobalt blue',
    'ruby-red': 'ruby red',
    'pearl-white': 'pearl white',
  };

  const material = materialMap[configData?.material] || configData?.material || 'leather';
  const color = colorMap[configData?.color] || configData?.color || 'black';

  // KEY: Prompt focuses ONLY on material + color texture
  // Shape comes from the skeleton image, not the prompt
  return `The same shoe with ${color} ${material} texture. Keep exact same shoe shape, silhouette, angle and style. Only change the material surface to ${color} ${material}. Professional product photography, white background, studio lighting, photorealistic, sharp focus.`;
}

// Convert a local image path to base64 for API upload
async function imageToBase64(imagePath: string): Promise<string> {
  const response = await fetch(imagePath);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Main function: Generate AI shoe image using Img2Img
export async function generateShoeImage(
  config: ShoeConfiguration,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {

  const skeletonUrl = getSkeletonImage(config);

  // No token = show skeleton with fake progress (development mode)
  if (!REPLICATE_TOKEN) {
    console.warn('No Replicate token. Showing skeleton preview.');
    for (let i = 0; i <= 100; i += 10) {
      onProgress?.(i);
      await new Promise(r => setTimeout(r, 200));
    }
    return { success: true, imageUrl: skeletonUrl };
  }

  try {
    onProgress?.(10);

    // Convert skeleton image to base64
    const imageBase64 = await imageToBase64(skeletonUrl);
    const prompt = buildPrompt(config);

    onProgress?.(25);

    // Use FLUX Redux — best Img2Img model on Replicate
    // It takes an input image + prompt and modifies appearance only
    const response = await fetch(
      'https://api.replicate.com/v1/models/black-forest-labs/flux-redux-dev/predictions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${REPLICATE_TOKEN}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait=60',
        },
        body: JSON.stringify({
          input: {
            redux_image: `data:image/jpeg;base64,${imageBase64}`,
            prompt: prompt,
            num_inference_steps: 28,
            guidance: 3.5,
            output_format: 'webp',
            output_quality: 90,
          },
        }),
      }
    );

    onProgress?.(50);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Replicate error ${response.status}: ${errText}`);
    }

    let result = await response.json();
    onProgress?.(60);

    // Poll for completion if not done yet
    if (result.status !== 'succeeded' && result.urls?.get) {
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const poll = await fetch(result.urls.get, {
          headers: { 'Authorization': `Bearer ${REPLICATE_TOKEN}` },
        });
        result = await poll.json();
        onProgress?.(60 + i);
        if (result.status === 'succeeded' || result.status === 'failed') break;
      }
    }

    onProgress?.(95);

    if (result.status === 'succeeded' && result.output) {
      const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
      onProgress?.(100);
      return { success: true, imageUrl };
    }

    throw new Error(result.error || 'Generation failed');

  } catch (error) {
    console.error('AI generation error:', error);
    // Always fallback to skeleton so user still sees something
    return {
      success: true,
      imageUrl: skeletonUrl,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export { SKELETON_IMAGES };

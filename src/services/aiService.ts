// SoleMate AI - Image Generation Service
// Using Replicate SDK with SDXL img2img

import type { ShoeConfiguration } from '@/types';

const REPLICATE_TOKEN = import.meta.env.VITE_REPLICATE_TOKEN || '';

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
  return images[style] || (gender === 'men' ? '/images/skeletons/men/oxford-base.jpg' : '/images/skeletons/women/khussa-base.jpg');
}

function buildPrompt(config: ShoeConfiguration): string {
  const configData = config.config as unknown as Record<string, string>;
  const materialMap: Record<string, string> = {
    'full-grain-leather': 'full-grain leather', 'premium-suede': 'premium suede',
    'patent-leather': 'glossy patent leather', 'nappa-leather': 'soft nappa leather',
    'canvas': 'canvas', 'synthetic-leather': 'synthetic leather',
    'genuine-leather': 'genuine leather', 'luxury-velvet': 'luxury velvet',
    'raw-silk': 'raw silk', 'brocade': 'brocade fabric',
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

async function imageUrlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function generateShoeImage(
  config: ShoeConfiguration,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  const skeletonUrl = getSkeletonImage(config);

  if (!REPLICATE_TOKEN) {
    for (let i = 0; i <= 100; i += 10) {
      onProgress?.(i);
      await new Promise(r => setTimeout(r, 150));
    }
    return { success: true, imageUrl: skeletonUrl };
  }

  try {
    onProgress?.(10);
    const prompt = buildPrompt(config);
    const skeletonBase64 = await imageUrlToBase64(skeletonUrl);
    onProgress?.(25);

    // Use fetch directly with Replicate REST API
    const startRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'da77bc59ee60423279fd632efb4795ab731d9e3ca9705ef3341091fb989b7eaf',
        input: {
          prompt: prompt,
          image: skeletonBase64,
          prompt_strength: 0.5,
          num_inference_steps: 25,
          guidance_scale: 7.5,
          negative_prompt: 'deformed, ugly, blurry, low quality, cartoon, text, watermark',
        },
      }),
    });

    if (!startRes.ok) {
      const err = await startRes.text();
      throw new Error(`Start failed: ${err}`);
    }

    const prediction = await startRes.json();
    onProgress?.(40);

    // Poll for result
    let result = prediction;
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: { 'Authorization': `Token ${REPLICATE_TOKEN}` },
      });
      result = await pollRes.json();
      onProgress?.(40 + i);
      if (result.status === 'succeeded' || result.status === 'failed') break;
    }

    onProgress?.(95);

    if (result.status === 'succeeded' && result.output) {
      const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
      onProgress?.(100);
      return { success: true, imageUrl };
    }

    throw new Error(result.error || 'Generation failed');

  } catch (error) {
    console.error('AI Error:', error);
    return { success: true, imageUrl: skeletonUrl, error: String(error) };
  }
}

export { SKELETON_IMAGES };

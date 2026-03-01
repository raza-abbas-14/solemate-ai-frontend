// SoleMate AI - AI Image Generation Service
// Using Replicate + FLUX Dev model for realistic shoe images

import type { ShoeConfiguration } from '@/types';

const REPLICATE_TOKEN = import.meta.env.VITE_REPLICATE_TOKEN || '';

// Skeleton base images
const SKELETON_IMAGES: Record<string, Record<string, string>> = {
  men: {
    'penny-loafer': '/images/skeletons/classic-penny-base.jpg',
    'chunky-loafer': '/images/skeletons/chunky-loafer-base.jpg',
    'oxford': '/images/skeletons/oxford-base.jpg',
    'double-monk': '/images/skeletons/oxford-base.jpg',
    'chelsea-boot': '/images/skeletons/oxford-base.jpg',
    'wingtip-brogue': '/images/skeletons/oxford-base.jpg',
    'tassel-loafer': '/images/skeletons/classic-penny-base.jpg',
    'suede-slip-on': '/images/skeletons/suede-slipon-base.jpg',
  },
  women: {
    'khussa': '/images/skeletons/khussa-base.jpg',
    'pump': '/images/skeletons/pump-base.jpg',
    'block-heel': '/images/skeletons/block-heel-base.jpg',
    'stiletto': '/images/skeletons/stiletto-base.jpg',
    'kolhapuri': '/images/skeletons/khussa-base.jpg',
    'mules': '/images/skeletons/pump-base.jpg',
    'jutti': '/images/skeletons/khussa-base.jpg',
    'wedge': '/images/skeletons/block-heel-base.jpg',
  },
};

function getSkeletonImage(config: ShoeConfiguration): string {
  const configData = config.config as Record<string, string>;
  const style = configData?.style || '';
  const gender = config.gender;
  const images = gender === 'men' ? SKELETON_IMAGES.men : SKELETON_IMAGES.women;
  return images[style] || (gender === 'men' ? '/images/skeletons/oxford-base.jpg' : '/images/skeletons/khussa-base.jpg');
}

function buildPrompt(config: ShoeConfiguration): string {
  const configData = config.config as Record<string, string>;
  const materialMap: Record<string, string> = {
    'full-grain-leather': 'full-grain leather', 'premium-suede': 'premium suede',
    'patent-leather': 'shiny patent leather', 'nappa-leather': 'soft nappa leather',
    'canvas': 'canvas', 'synthetic-leather': 'synthetic leather',
    'genuine-leather': 'genuine leather', 'luxury-velvet': 'rich luxury velvet',
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
  return `Professional product photography of a ${config.gender}'s ${material} shoe in ${color} color. Plain white studio background, soft lighting, sharp focus, high-end fashion catalog, photorealistic, 4K quality.`;
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
    onProgress?.(20);

    const response = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-dev/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_TOKEN}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait=30',
      },
      body: JSON.stringify({
        input: { prompt, width: 1024, height: 1024, num_inference_steps: 28, guidance: 3.5, output_format: 'webp', output_quality: 90 },
      }),
    });

    onProgress?.(50);
    if (!response.ok) throw new Error(`Replicate error: ${response.status}`);

    const prediction = await response.json();
    onProgress?.(70);

    let result = prediction;
    if (result.status !== 'succeeded') {
      const pollUrl = result.urls?.get;
      if (pollUrl) {
        for (let attempt = 0; attempt < 30; attempt++) {
          await new Promise(r => setTimeout(r, 2000));
          const pollRes = await fetch(pollUrl, { headers: { 'Authorization': `Bearer ${REPLICATE_TOKEN}` } });
          result = await pollRes.json();
          onProgress?.(70 + attempt);
          if (result.status === 'succeeded' || result.status === 'failed') break;
        }
      }
    }

    onProgress?.(95);
    if (result.status === 'succeeded' && result.output) {
      const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
      onProgress?.(100);
      return { success: true, imageUrl };
    }
    throw new Error('Generation failed');

  } catch (error) {
    return { success: true, imageUrl: skeletonUrl, error: error instanceof Error ? error.message : 'Unknown' };
  }
}

export { getSkeletonImage, buildPrompt, SKELETON_IMAGES };

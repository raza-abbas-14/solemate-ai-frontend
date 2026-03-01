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
  return `professional product photo of a ${color} ${material} shoe, plain white background, studio lighting, photorealistic, 4k, high quality`;
}

export async function generateShoeImage(
  config: ShoeConfiguration,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  const skeletonUrl = getSkeletonImage(config);

  try {
    onProgress?.(10);
    const prompt = buildPrompt(config);

    // Step 1: Start prediction via our Vercel backend
    const startRes = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!startRes.ok) throw new Error(`Start failed: ${startRes.status}`);

    const { predictionId, token } = await startRes.json();
    onProgress?.(30);

    // Step 2: Poll Replicate directly from browser
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 2000));
      
      const pollRes = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        { headers: { 'Authorization': `Token ${token}` } }
      );
      
      const result = await pollRes.json();
      onProgress?.(30 + i * 2);

      if (result.status === 'succeeded' && result.output) {
        const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
        onProgress?.(100);
        return { success: true, imageUrl };
      }

      if (result.status === 'failed') {
        throw new Error(result.error || 'Generation failed');
      }
    }

    throw new Error('Timeout');

  } catch (error) {
    console.error('AI Error:', error);
    return { success: true, imageUrl: skeletonUrl, error: String(error) };
  }
}

export { SKELETON_IMAGES };

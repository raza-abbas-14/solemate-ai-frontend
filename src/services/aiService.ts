import type { Img2ImgRequest, Img2ImgResponse } from '../types/stability';

const API_KEY = import.meta.env.VITE_STABILITY_API_KEY;
const API_HOST = import.meta.env.VITE_STABILITY_API_HOST || 'https://api.stability.ai';

if (!API_KEY) {
  console.warn('VITE_STABILITY_API_KEY not set');
}

const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
};

export const generateImg2Img = async (
  params: Img2ImgRequest
): Promise<Img2ImgResponse> => {
  if (!API_KEY) {
    throw new Error('VITE_STABILITY_API_KEY not configured');
  }

  const imageBase64 = await fileToBase64(params.image);

  const requestBody = {
    text_prompts: [
      { text: params.prompt, weight: 1.0 },
      ...(params.negativePrompt
        ? [{ text: params.negativePrompt, weight: -1.0 }]
        : []),
    ],
    init_image: imageBase64,
    strength: params.strength ?? 0.7,
    steps: params.steps ?? 30,
    cfg_scale: params.cfgScale ?? 7,
    samples: params.samples ?? 1,
    seed: params.seed ?? 0,
    style_preset: params.stylePreset,
  };

  const engineId = 'stable-diffusion-xl-1024-v1-0';
  
  const response = await fetch(
    `${API_HOST}/v1/generation/${engineId}/image-to-image`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Stability API error (${response.status}): ${errorText}`);
  }

  return response.json();
};
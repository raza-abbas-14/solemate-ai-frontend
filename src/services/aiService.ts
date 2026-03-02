import type { Img2ImgRequest, Img2ImgResponse } from '../types/stability';

const API_KEY = import.meta.env.VITE_STABILITY_API_KEY;
const API_HOST = import.meta.env.VITE_STABILITY_API_HOST || 'https://api.stability.ai';

if (!API_KEY) {
  console.warn('VITE_STABILITY_API_KEY not set');
}

export const generateImg2Img = async (
  params: Img2ImgRequest
): Promise<Img2ImgResponse> => {
  if (!API_KEY) {
    throw new Error('VITE_STABILITY_API_KEY not configured');
  }

  const formData = new FormData();
  
  // Append the image file
  formData.append('init_image', params.image);
  
  // Build prompts array
  const prompts = [
    { text: params.prompt, weight: 1.0 },
  ];
  
  if (params.negativePrompt) {
    prompts.push({ text: params.negativePrompt, weight: -1.0 });
  }

  // Send text_prompts as individual array items (NOT JSON string)
  // Format: text_prompts[0][text], text_prompts[0][weight], etc.
  prompts.forEach((prompt, index) => {
    formData.append(`text_prompts[${index}][text]`, prompt.text);
    formData.append(`text_prompts[${index}][weight]`, String(prompt.weight));
  });

  // Other parameters
  formData.append('strength', String(params.strength ?? 0.7));
  formData.append('steps', String(params.steps ?? 30));
  formData.append('cfg_scale', String(params.cfgScale ?? 7));
  formData.append('samples', String(params.samples ?? 1));
  formData.append('seed', String(params.seed ?? 0));
  
  if (params.stylePreset) {
    formData.append('style_preset', params.stylePreset);
  }

  const engineId = 'stable-diffusion-xl-1024-v1-0';
  
  const response = await fetch(
    `${API_HOST}/v1/generation/${engineId}/image-to-image`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Stability API error (${response.status}): ${errorText}`);
  }

  return response.json();
};
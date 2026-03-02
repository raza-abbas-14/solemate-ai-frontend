import type { Img2ImgRequest, Img2ImgResponse } from '../types/stability';

const API_KEY = import.meta.env.VITE_STABILITY_API_KEY;
const API_HOST = import.meta.env.VITE_STABILITY_API_HOST || 'https://api.stability.ai';

if (!API_KEY) {
  console.warn('VITE_STABILITY_API_KEY not set');
}

/**
 * Stability AI Img2Img generation using FormData (multipart/form-data)
 * This is REQUIRED by the Stability AI API - JSON format is not accepted
 */
export const generateImg2Img = async (
  params: Img2ImgRequest
): Promise<Img2ImgResponse> => {
  if (!API_KEY) {
    throw new Error('VITE_STABILITY_API_KEY not configured');
  }

  const formData = new FormData();
  
  // Append the image file directly (must be File or Blob)
  formData.append('init_image', params.image);
  
  // Append text prompts as individual form fields (NOT JSON string)
  // Stability API expects: text_prompts[0][text], text_prompts[0][weight]
  formData.append('text_prompts[0][text]', params.prompt);
  formData.append('text_prompts[0][weight]', '1.0');
  
  // Add negative prompt if provided
  if (params.negativePrompt) {
    formData.append('text_prompts[1][text]', params.negativePrompt);
    formData.append('text_prompts[1][weight]', '-1.0');
  }

  // Append other parameters
  formData.append('strength', String(params.strength ?? 0.65));
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
        // NOTE: Do NOT set Content-Type - browser sets it automatically with boundary
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
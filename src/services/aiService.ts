import type { Img2ImgRequest, Img2ImgResponse } from '../types/stability';

// Securely route calls through Vercel Serverless integration
const BACKEND_URL = '/api/generate';

const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const generateImg2Img = async (
  params: Img2ImgRequest
): Promise<Img2ImgResponse> => {

  let base64Image = '';
  if (params.image instanceof File || params.image instanceof Blob) {
    base64Image = await fileToBase64(params.image);
  } else if (typeof params.image === 'string') {
    base64Image = params.image;
  }

  const payload = {
    prompt: params.prompt,
    negative_prompt: params.negativePrompt || '',
    image: base64Image,
    strength: params.strength ?? 0.7,
  };

  const response = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(`AI generation failed: ${errorData?.error || response.statusText}`);
  }

  const data = await response.json();

  // Replicate returns standard output URLs. 
  // We fetch the resulting URL and mock the original Stability API Base64 response format 
  // so the frontend seamlessly works without having to redesign all React components.
  const imgResp = await fetch(data.imageUrl);
  const blob = await imgResp.blob();
  const resultBase64DataUri = await fileToBase64(blob);
  const base64Raw = resultBase64DataUri.split(',')[1] || resultBase64DataUri;

  return {
    artifacts: [
      {
        base64: base64Raw,
        seed: 0,
        finishReason: 'SUCCESS'
      }
    ]
  };
};
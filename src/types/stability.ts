export interface Img2ImgRequest {
    image: File | Blob;
    prompt: string;
    negativePrompt?: string;
    strength?: number;
    steps?: number;
    cfgScale?: number;
    samples?: number;
    seed?: number;
    stylePreset?: string;
  }
  
  export interface Img2ImgArtifact {
    base64: string;
    seed: number;
    finishReason: string;
  }
  
  export interface Img2ImgResponse {
    artifacts: Img2ImgArtifact[];
  }
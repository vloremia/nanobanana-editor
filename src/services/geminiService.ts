import { GoogleGenAI } from '@google/genai';

// SECURITY WARNING: In production, API keys should NEVER be in client-side code.
// This is a development-only setup. For production, implement a backend proxy
// to handle all API calls securely.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error(
    'VITE_GEMINI_API_KEY is not set. Please add it to your .env file.\n' +
    'Get your API key from: https://aistudio.google.com/'
  );
}

if (API_KEY === 'demo-key') {
  console.warn(
    '⚠️  WARNING: Using demo API key. This will not work for production.\n' +
    'Please set a valid VITE_GEMINI_API_KEY in your .env file.'
  );
}

const genAI = new GoogleGenAI({ apiKey: API_KEY });

export interface GenerationRequest {
  prompt: string;
  referenceImages?: string[]; // base64 array
  temperature?: number;
  seed?: number;
}

export interface EditRequest {
  instruction: string;
  originalImage: string; // base64
  referenceImages?: string[]; // base64 array
  maskImage?: string; // base64
  temperature?: number;
  seed?: number;
}

export interface SegmentationRequest {
  image: string; // base64
  query: string; // "the object at pixel (x,y)" or "the red car"
}

export class GeminiService {
  async generateImage(request: GenerationRequest): Promise<string[]> {
    try {
      const contents: any[] = [{ text: request.prompt }];
      
      // Add reference images if provided
      if (request.referenceImages && request.referenceImages.length > 0) {
        request.referenceImages.forEach(image => {
          contents.push({
            inlineData: {
              mimeType: "image/png",
              data: image,
            },
          });
        });
      }

      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents,
      });

      const images: string[] = [];

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          images.push(part.inlineData.data);
        }
      }

      if (images.length === 0) {
        throw new Error('No images were generated. The model may have blocked the request due to safety filters.');
      }

      return images;
    } catch (error: any) {
      console.error('Error generating image:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('API key')) {
        throw new Error('Invalid API key. Please check your VITE_GEMINI_API_KEY in .env file.');
      }
      
      if (error.message?.includes('quota')) {
        throw new Error('API quota exceeded. Please check your Google AI Studio quota limits.');
      }
      
      if (error.message?.includes('safety')) {
        throw new Error('Content blocked by safety filters. Please try a different prompt.');
      }
      
      if (error.message?.includes('RESOURCE_EXHAUSTED')) {
        throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
      }
      
      throw new Error(error.message || 'Failed to generate image. Please check your internet connection and try again.');
    }
  }

  async editImage(request: EditRequest): Promise<string[]> {
    try {
      const contents = [
        { text: this.buildEditPrompt(request) },
        {
          inlineData: {
            mimeType: "image/png",
            data: request.originalImage,
          },
        },
      ];

      // Add reference images if provided
      if (request.referenceImages && request.referenceImages.length > 0) {
        request.referenceImages.forEach(image => {
          contents.push({
            inlineData: {
              mimeType: "image/png",
              data: image,
            },
          });
        });
      }

      if (request.maskImage) {
        contents.push({
          inlineData: {
            mimeType: "image/png",
            data: request.maskImage,
          },
        });
      }

      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents,
      });

      const images: string[] = [];

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          images.push(part.inlineData.data);
        }
      }

      if (images.length === 0) {
        throw new Error('No edited images were generated. The model may have blocked the request.');
      }

      return images;
    } catch (error: any) {
      console.error('Error editing image:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('API key')) {
        throw new Error('Invalid API key. Please check your VITE_GEMINI_API_KEY in .env file.');
      }
      
      if (error.message?.includes('quota')) {
        throw new Error('API quota exceeded. Please check your Google AI Studio quota limits.');
      }
      
      if (error.message?.includes('safety')) {
        throw new Error('Edit blocked by safety filters. Please try different instructions or image.');
      }
      
      if (error.message?.includes('RESOURCE_EXHAUSTED')) {
        throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
      }
      
      throw new Error(error.message || 'Failed to edit image. Please check your internet connection and try again.');
    }
  }

  async segmentImage(request: SegmentationRequest): Promise<any> {
    try {
      const prompt = [
        { text: `Analyze this image and create a segmentation mask for: ${request.query}

Return a JSON object with this exact structure:
{
  "masks": [
    {
      "label": "description of the segmented object",
      "box_2d": [x, y, width, height],
      "mask": "base64-encoded binary mask image"
    }
  ]
}

Only segment the specific object or region requested. The mask should be a binary PNG where white pixels (255) indicate the selected region and black pixels (0) indicate the background.` },
        {
          inlineData: {
            mimeType: "image/png",
            data: request.image,
          },
        },
      ];

      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents: prompt,
      });

      const responseText = response.candidates[0].content.parts[0].text;
      return JSON.parse(responseText);
    } catch (error) {
      console.error('Error segmenting image:', error);
      throw new Error('Failed to segment image. Please try again.');
    }
  }

  private buildEditPrompt(request: EditRequest): string {
    const maskInstruction = request.maskImage 
      ? "\n\nIMPORTANT: Apply changes ONLY where the mask image shows white pixels (value 255). Leave all other areas completely unchanged. Respect the mask boundaries precisely and maintain seamless blending at the edges."
      : "";

    return `Edit this image according to the following instruction: ${request.instruction}

Maintain the original image's lighting, perspective, and overall composition. Make the changes look natural and seamlessly integrated.${maskInstruction}

Preserve image quality and ensure the edit looks professional and realistic.`;
  }
}

export const geminiService = new GeminiService();
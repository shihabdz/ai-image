import { toast } from "sonner";

const REPLICATE_API_URL = "/api/replicate/predictions";

export interface GenerationResponse {
  id: string;
  urls: {
    get: string;
    cancel: string;
  };
  status: "starting" | "processing" | "succeeded" | "failed";
  output?: string[];
  error?: string;
}

export const generateImage = async (prompt: string, apiKey: string): Promise<GenerationResponse> => {
  try {
    console.log("Generating image with prompt:", prompt);
    const response = await fetch(REPLICATE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${apiKey}`,
      },
      body: JSON.stringify({
        version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        input: {
          prompt,
          negative_prompt: "ugly, blurry, low quality, distorted",
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 50,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 402) {
        toast.error("Billing setup required for Replicate API. Please visit https://replicate.com/account/billing to set up billing.");
        throw new Error("Billing setup required for Replicate API");
      }
      throw new Error(errorData.detail || "Failed to generate image");
    }

    const data = await response.json();
    console.log("Generation response:", data);
    return data;
  } catch (error) {
    console.error("Error generating image:", error);
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("Failed to generate image");
    }
    throw error;
  }
};

export const checkGenerationStatus = async (
  url: string,
  apiKey: string
): Promise<GenerationResponse> => {
  const proxyUrl = url.replace('https://api.replicate.com/v1', '/api/replicate');

  try {
    console.log("Checking generation status at URL:", proxyUrl);
    const response = await fetch(proxyUrl, {
      headers: {
        "Authorization": `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to check generation status");
    }

    const data = await response.json();
    console.log("Status check response:", data);
    return data;
  } catch (error) {
    console.error("Error checking generation status:", error);
    throw error;
  }
};
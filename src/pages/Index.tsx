import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Wand2 } from "lucide-react";
import { generateImage, checkGenerationStatus, type GenerationResponse } from "@/lib/replicate";
import { toast } from "sonner";

const API_KEY_STORAGE_KEY = "replicate-api-key";

const Index = () => {
  const [prompt, setPrompt] = useState("");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE_KEY) || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
  }, [apiKey]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!apiKey.trim()) {
      toast.error("Please enter your Replicate API key");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const response = await generateImage(prompt, apiKey);
      
      // Poll for results
      const pollInterval = setInterval(async () => {
        const result = await checkGenerationStatus(response.urls.get, apiKey);
        
        if (result.status === "succeeded" && result.output) {
          clearInterval(pollInterval);
          setGeneratedImage(result.output[0]);
          setIsGenerating(false);
          toast.success("Image generated successfully!");
        } else if (result.status === "failed") {
          clearInterval(pollInterval);
          setIsGenerating(false);
          toast.error("Failed to generate image");
        }
      }, 1000);
    } catch (error) {
      setIsGenerating(false);
      // Error is already handled in the generateImage function
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gradient-radial from-background to-muted">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary">AI Image Generator</h1>
          <p className="text-muted-foreground">Create stunning images with the power of AI</p>
        </div>

        <Card className="p-6 backdrop-blur-sm bg-card/30">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="apiKey" className="text-sm font-medium">
                Replicate API Key
              </label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">
                Get your API key from{" "}
                <a
                  href="https://replicate.com/account/api-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Replicate API Tokens
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="prompt" className="text-sm font-medium">
                Prompt
              </label>
              <div className="flex gap-2">
                <Input
                  id="prompt"
                  placeholder="Enter your prompt..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="bg-background/50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                />
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="min-w-[120px]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {isGenerating && (
            <div className="aspect-square max-w-2xl mx-auto rounded-lg overflow-hidden loading-shimmer bg-muted" />
          )}
          
          {generatedImage && (
            <div className="aspect-square max-w-2xl mx-auto">
              <img
                src={generatedImage}
                alt="Generated"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
import React, { useRef, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface PhotoCaptureProps {
  photoPreview: string | null;
  onCapturePhoto: (file: File, preview: string) => void;
  onRemovePhoto: () => void;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  photoPreview,
  onCapturePhoto,
  onRemovePhoto,
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const [isCameraAvailable, setIsCameraAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [usingFrontCamera, setUsingFrontCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check if camera is available on mount
  useEffect(() => {
    const checkCameraAvailability = async () => {
      try {
        if (
          !navigator.mediaDevices ||
          typeof navigator.mediaDevices.getUserMedia !== "function"
        ) {
          setIsCameraAvailable(false);
          return;
        }

        // Just check if we can get permissions without actually starting the camera
        await navigator.mediaDevices.getUserMedia({ video: true });
        setIsCameraAvailable(true);
      } catch (error) {
        console.warn("Camera not available:", error);
        setIsCameraAvailable(false);
      }
    };

    checkCameraAvailability();
  }, []);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A foto deve ter no máximo 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("O arquivo deve ser uma imagem");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        onCapturePhoto(file, preview);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle camera capture
  const startCamera = async (useFrontCamera = false) => {
    try {
      // Check if mediaDevices API is available
      if (
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !== "function"
      ) {
        throw new Error(
          "Camera access not supported in this browser or device"
        );
      }

      // Stop previous stream if exists
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      setIsLoading(true);
      setCameraError(null);
      setShowCamera(true);
      setUsingFrontCamera(useFrontCamera);

      // Small delay to ensure the video element is mounted
      setTimeout(async () => {
        try {
          // For mobile, prioritize rear camera
          const constraints = {
            video: {
              facingMode: { ideal: useFrontCamera ? "user" : "environment" },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          };

          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          streamRef.current = stream;

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Wait for the video to be ready before allowing capture
            videoRef.current.onloadedmetadata = () => {
              if (videoRef.current) videoRef.current.play();
              setIsLoading(false);
            };
          }
        } catch (streamError) {
          console.error("Error starting camera stream:", streamError);
          // Try with simpler constraints as fallback
          try {
            const simpleStream = await navigator.mediaDevices.getUserMedia({
              video: true,
            });
            streamRef.current = simpleStream;
            if (videoRef.current) {
              videoRef.current.srcObject = simpleStream;
              videoRef.current.onloadedmetadata = () => {
                if (videoRef.current) videoRef.current.play();
                setIsLoading(false);
              };
            }
          } catch (fallbackError) {
            throw fallbackError;
          }
        }
      }, 300);
    } catch (error: any) {
      console.error("Error accessing camera:", error);
      let errorMessage = "Não foi possível acessar a câmera.";

      // Check for permission errors
      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        errorMessage =
          "Permissão de câmera negada. Por favor, permita o acesso à câmera nas configurações do seu navegador.";
      } else if (
        error.name === "NotFoundError" ||
        error.name === "DevicesNotFoundError"
      ) {
        errorMessage = "Nenhuma câmera encontrada no seu dispositivo.";
      } else if (
        error.name === "NotReadableError" ||
        error.name === "TrackStartError"
      ) {
        errorMessage =
          "Não foi possível acessar a câmera. Ela pode estar sendo usada por outro aplicativo.";
      }

      setCameraError(errorMessage);
      toast.error(
        "Não foi possível acessar a câmera. Tente usar o upload de imagem."
      );
      setShowCamera(false);
      setIsLoading(false);
    }
  };

  const flipCamera = () => {
    startCamera(!usingFrontCamera);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], "delivery-photo.jpg", {
                type: "image/jpeg",
              });
              const preview = canvas.toDataURL("image/jpeg");
              onCapturePhoto(file, preview);

              // Stop the camera stream
              closeCamera();
            }
          },
          "image/jpeg",
          0.8
        );
      }
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setShowCamera(false);
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">Foto da Entrega</CardTitle>
        <CardDescription>
          Tire uma foto dos materiais na entrega
        </CardDescription>
      </CardHeader>
      <CardContent>
        {photoPreview ? (
          <div className="relative">
            <img
              src={photoPreview}
              alt="Preview da foto"
              className="w-full h-auto rounded-md"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={onRemovePhoto}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {isCameraAvailable && (
              <Button
                type="button"
                variant="secondary"
                className="flex items-center gap-2"
                onClick={() => startCamera()}
              >
                <Camera className="h-5 w-5" />
                Tirar uma foto
              </Button>
            )}

            <div className="relative">
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <Label
                htmlFor="photo"
                className="text-xs text-muted-foreground mt-1"
              >
                {isCameraAvailable
                  ? "Ou selecione uma imagem do dispositivo"
                  : "Selecione uma imagem do dispositivo"}
              </Label>
            </div>
          </div>
        )}

        {showCamera && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col">
            <div className="p-4 flex justify-between items-center bg-black text-white">
              <Button
                variant="ghost"
                size="sm"
                className="text-white"
                onClick={closeCamera}
              >
                Cancelar
              </Button>
              <span>Câmera</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-white"
                onClick={flipCamera}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 relative bg-black flex items-center justify-center">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
                  <div className="text-white text-center">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p>Iniciando câmera...</p>
                  </div>
                </div>
              )}

              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10 p-4">
                  <div className="text-white text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 mx-auto mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <p className="text-sm">{cameraError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 text-white border-white hover:bg-white/20"
                      onClick={closeCamera}
                    >
                      Fechar
                    </Button>
                  </div>
                </div>
              )}

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <div className="p-4 flex justify-center bg-black">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full w-16 h-16 bg-white border-4 border-gray-300"
                onClick={capturePhoto}
                disabled={isLoading}
              />
            </div>

            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

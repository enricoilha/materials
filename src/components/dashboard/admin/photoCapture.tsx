import React, { useRef, useState } from "react";
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
import { Camera, X } from "lucide-react";
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
  const startCamera = async () => {
    try {
      setShowCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Não foi possível acessar a câmera");
      setShowCamera(false);
    }
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
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
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
            <Button
              type="button"
              variant="secondary"
              className="flex items-center gap-2"
              onClick={startCamera}
            >
              <Camera className="h-5 w-5" />
              Tirar uma foto
            </Button>

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
                Ou selecione uma imagem do dispositivo
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
              <div className="w-16"></div> {/* Spacer for alignment */}
            </div>

            <div className="flex-1 relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            <div className="p-4 flex justify-center bg-black">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full w-16 h-16 bg-white border-4 border-gray-300"
                onClick={capturePhoto}
              />
            </div>

            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

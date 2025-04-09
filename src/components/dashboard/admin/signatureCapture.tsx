import React, { useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SignatureCaptureProps {
  signatureData: string | null;
  onCaptureSignature: (signatureData: string) => void;
  onRemoveSignature: () => void;
  recipientName?: string;
}

export const SignatureCapture: React.FC<SignatureCaptureProps> = ({
  signatureData,
  onCaptureSignature,
  onRemoveSignature,
  recipientName,
}) => {
  const [showSignaturePad, setShowSignaturePad] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const signaturePadRef = useRef<HTMLCanvasElement | null>(null);
  const signatureCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Initialize signature pad when it's shown
  useEffect(() => {
    if (showSignaturePad && signaturePadRef.current) {
      const canvas = signaturePadRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Set canvas dimensions to match the container
        const container = canvas.parentElement;
        if (container) {
          const rect = container.getBoundingClientRect();
          canvas.width = rect.width;
          // Adjust height based on device type
          canvas.height = isMobile
            ? Math.min(480, window.innerHeight * 0.5)
            : 480;
        } else {
          canvas.width = 300;
          // Adjust height based on device type
          canvas.height = isMobile
            ? Math.min(300, window.innerHeight * 0.4)
            : 480;
        }

        ctx.lineWidth = 2.5; // Slightly thicker line
        ctx.lineCap = "round";
        ctx.lineJoin = "round"; // Smooth line joins
        ctx.strokeStyle = "#000";
        signatureCtxRef.current = ctx;

        // Clear canvas
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add a subtle signature line
        const lineY = canvas.height * 0.7;
        ctx.beginPath();
        ctx.moveTo(20, lineY);
        ctx.lineTo(canvas.width - 20, lineY);
        ctx.strokeStyle = "#e2e2e2";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Reset for drawing
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2.5;
      }
    }
  }, [showSignaturePad, isMobile]);

  const startSignatureCapture = () => {
    setShowSignaturePad(true);
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!signatureCtxRef.current) return;

    signatureCtxRef.current.beginPath();

    // Get position based on event type
    let x, y;
    if ("touches" in e) {
      const rect = signaturePadRef.current?.getBoundingClientRect();
      const canvas = signaturePadRef.current;
      if (rect && canvas) {
        // Calculate the scale factor between the canvas's logical size and its display size
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        // Get touch position relative to the canvas
        x = (e.touches[0].clientX - rect.left) * scaleX;
        y = (e.touches[0].clientY - rect.top) * scaleY;
      } else {
        return;
      }
    } else {
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }

    signatureCtxRef.current.moveTo(x, y);

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!signatureCtxRef.current) return;

      let newX, newY;
      if ("touches" in moveEvent) {
        const rect = signaturePadRef.current?.getBoundingClientRect();
        const canvas = signaturePadRef.current;
        if (rect && canvas) {
          // Calculate the scale factor between the canvas's logical size and its display size
          const scaleX = canvas.width / rect.width;
          const scaleY = canvas.height / rect.height;

          // Get touch position relative to the canvas
          newX = (moveEvent.touches[0].clientX - rect.left) * scaleX;
          newY = (moveEvent.touches[0].clientY - rect.top) * scaleY;
        } else {
          return;
        }
      } else {
        newX = moveEvent.offsetX;
        newY = moveEvent.offsetY;
      }

      signatureCtxRef.current.lineTo(newX, newY);
      signatureCtxRef.current.stroke();
    };

    const handleMouseMove = (moveEvent: MouseEvent) => handleMove(moveEvent);
    const handleTouchMove = (moveEvent: TouchEvent) => {
      moveEvent.preventDefault();
      handleMove(moveEvent);
    };

    const stopDrawing = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", stopDrawing);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", stopDrawing);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopDrawing);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", stopDrawing);
  };

  const clearSignature = () => {
    if (signaturePadRef.current && signatureCtxRef.current) {
      const canvas = signaturePadRef.current;
      signatureCtxRef.current.fillStyle = "#fff";
      signatureCtxRef.current.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveSignature = () => {
    if (signaturePadRef.current) {
      const dataUrl = signaturePadRef.current.toDataURL("image/png");
      onCaptureSignature(dataUrl);
      setShowSignaturePad(false);
    }
  };

  const cancelSignature = () => {
    setShowSignaturePad(false);
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">Assinatura</CardTitle>
        <CardDescription>
          Solicite uma assinatura de quem está recebendo a entrega
        </CardDescription>
      </CardHeader>
      <CardContent>
        {signatureData ? (
          <div className="relative">
            <img
              src={signatureData}
              alt="Assinatura"
              className="w-full h-auto bg-white rounded-md border"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={onRemoveSignature}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={startSignatureCapture}
          >
            Capturar Assinatura
          </Button>
        )}

        {showSignaturePad && (
          <div className="fixed inset-0 bg-black/80 z-50 flex flex-col p-4">
            <div className="bg-white rounded-lg flex flex-col max-w-md w-full mx-auto overflow-hidden h-[90vh] max-h-[600px]">
              <div className="p-4 flex justify-between items-center border-b">
                <Button variant="ghost" size="sm" onClick={cancelSignature}>
                  Cancelar
                </Button>
                <span className="font-medium">Assinatura</span>
                <Button variant="ghost" size="sm" onClick={clearSignature}>
                  Limpar
                </Button>
              </div>

              {recipientName && (
                <div className="px-4 pt-2 pb-0">
                  <p className="text-sm text-center text-muted-foreground">
                    Assinando como:{" "}
                    <span className="font-medium">{recipientName}</span>
                  </p>
                </div>
              )}

              <div className="p-4 bg-white border-b">
                <div className="relative rounded-md overflow-hidden shadow-sm border-2 border-gray-200">
                  <canvas
                    ref={signaturePadRef}
                    className="border rounded-md w-full touch-none bg-white"
                    onMouseDown={startDrawing}
                    onTouchStart={startDrawing}
                  />
                  <p className="absolute bottom-2 right-0 left-0 text-xs text-center text-muted-foreground bg-white/70 py-1">
                    Assine no campo acima
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="inline-block mr-1"
                    >
                      <path d="M12 19a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z"></path>
                      <path d="M12 19v2"></path>
                      <path d="M12 3V1"></path>
                      <path d="m4.6 4.6 1.4 1.4"></path>
                      <path d="m19.4 4.6-1.4 1.4"></path>
                    </svg>
                    Use o dedo para desenhar sua assinatura
                  </span>
                </div>
              </div>

              <div className="p-4">
                <Button className="w-full" onClick={saveSignature}>
                  Salvar Assinatura
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

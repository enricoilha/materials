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
}

export const SignatureCapture: React.FC<SignatureCaptureProps> = ({
  signatureData,
  onCaptureSignature,
  onRemoveSignature,
}) => {
  const [showSignaturePad, setShowSignaturePad] = React.useState(false);
  const signaturePadRef = useRef<HTMLCanvasElement | null>(null);
  const signatureCtxRef = useRef<CanvasRenderingContext2D | null>(null);

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
          canvas.height = 200;
        } else {
          canvas.width = 300;
          canvas.height = 200;
        }

        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#000";
        signatureCtxRef.current = ctx;

        // Clear canvas
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [showSignaturePad]);

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
      if (rect) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
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
        if (rect) {
          newX = moveEvent.touches[0].clientX - rect.left;
          newY = moveEvent.touches[0].clientY - rect.top;
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
            <div className="bg-white rounded-lg flex flex-col max-w-md w-full mx-auto overflow-hidden">
              <div className="p-4 flex justify-between items-center border-b">
                <Button variant="ghost" size="sm" onClick={cancelSignature}>
                  Cancelar
                </Button>
                <span className="font-medium">Assinatura</span>
                <Button variant="ghost" size="sm" onClick={clearSignature}>
                  Limpar
                </Button>
              </div>

              <div className="p-4 bg-white border-b">
                <canvas
                  ref={signaturePadRef}
                  className="border rounded-md w-full touch-none"
                  onMouseDown={startDrawing}
                  onTouchStart={startDrawing}
                />
                <p className="mt-2 text-xs text-center text-muted-foreground">
                  Assine no campo acima
                </p>
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

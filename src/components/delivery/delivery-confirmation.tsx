"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatToReais } from "@/lib/utils";

interface DeliveryConfirmationProps {
  listaId: string;
  items: Array<{
    id: string;
    material: {
      materiais: string;
      tipo: string;
    };
    quantidade: number;
    preco: number;
  }>;
  onConfirm: (photoUrl: string) => Promise<void>;
}

export function DeliveryConfirmation({
  listaId,
  items,
  onConfirm,
}: DeliveryConfirmationProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setPhoto(file);
    }
  };

  const handleSubmit = async () => {
    if (!photo) {
      toast.error("Por favor, selecione uma foto dos materiais");
      return;
    }

    setIsLoading(true);
    try {
      // Upload photo to storage
      const formData = new FormData();
      formData.append("file", photo);
      formData.append("listaId", listaId);

      const response = await fetch("/api/delivery/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro ao fazer upload da foto");
      }

      const { photoUrl } = await response.json();
      await onConfirm(photoUrl);
      toast.success("Entrega confirmada com sucesso!");
    } catch (error) {
      console.error("Erro ao confirmar entrega:", error);
      toast.error("Erro ao confirmar entrega");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirmar Entrega de Materiais</CardTitle>
        <CardDescription>
          Revise os materiais e envie uma foto para confirmar a entrega
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Preço Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.material.materiais}</TableCell>
                  <TableCell>{item.material.tipo}</TableCell>
                  <TableCell className="text-right">
                    {item.quantidade}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatToReais(item.preco * item.quantidade)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-2">
          <Label htmlFor="photo">Foto dos Materiais</Label>
          <Input
            id="photo"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
          />
          <p className="text-sm text-muted-foreground">
            Envie uma foto dos materiais recebidos para confirmar a entrega
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isLoading || !photo}
          className="w-full"
        >
          {isLoading ? "Confirmando..." : "Confirmar Entrega"}
        </Button>
      </CardContent>
    </Card>
  );
}

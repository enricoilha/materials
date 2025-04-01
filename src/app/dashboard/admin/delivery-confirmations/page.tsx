"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { formatToReais } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { v4 as uuidv4 } from "uuid";

interface List {
  id: string;
  month: string;
  status: string;
  preco_total: number;
  created_at: string;
  filled_at: string | null;
  profissional: {
    id: string;
    nome: string;
    funcao: string | null;
    clinica: string | null;
    sindicato: string | null;
    email: string | null;
    telefone: string | null;
  };
}

interface DeliveryConfirmation {
  id: string;
  lista_id: string;
  photo_url: string;
  observations: string;
  created_at: string;
}

export default function AdminDeliveryConfirmationsPage() {
  const [lists, setLists] = useState<List[]>([]);
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [observations, setObservations] = useState("");
  const [isDelivered, setIsDelivered] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const response = await fetch("/api/reports/lists");
      if (!response.ok) throw new Error("Failed to fetch lists");
      const data = await response.json();
      setLists(data);
    } catch (error) {
      console.error("Error fetching lists:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as listas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A foto deve ter no máximo 5MB",
          variant: "destructive",
        });
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Erro",
          description: "O arquivo deve ser uma imagem",
          variant: "destructive",
        });
        return;
      }
      setPhotoFile(file);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!selectedList || !photoFile || !isDelivered) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Generate unique filename
      const fileExt = photoFile.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `delivery-photos/${selectedList.id}/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("confirmations")
        .upload(filePath, photoFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("confirmations").getPublicUrl(filePath);

      // Confirm delivery
      const confirmResponse = await fetch("/api/delivery/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listaId: selectedList.id,
          photoUrl: publicUrl,
          observations,
        }),
      });

      if (!confirmResponse.ok) throw new Error("Failed to confirm delivery");

      toast({
        title: "Sucesso",
        description: "Entrega confirmada com sucesso",
      });

      // Reset form and refresh lists
      setSelectedList(null);
      setPhotoFile(null);
      setObservations("");
      setIsDelivered(false);
      fetchLists();
    } catch (error) {
      console.error("Error confirming delivery:", error);
      toast({
        title: "Erro",
        description: "Não foi possível confirmar a entrega",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const statusMap = {
    filled: { label: "Preenchida", variant: "default" },
    not_filled: { label: "Não Preenchida", variant: "outline" },
    delivered: { label: "Entregue", variant: "success" },
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Confirmação de Entregas
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Listas Disponíveis</CardTitle>
              <CardDescription>
                Selecione uma lista para confirmar a entrega
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Mês</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lists.map((list) => (
                    <TableRow
                      key={list.id}
                      className={`cursor-pointer ${
                        selectedList?.id === list.id
                          ? "bg-muted"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedList(list)}
                    >
                      <TableCell>{list.profissional.nome}</TableCell>
                      <TableCell>{list.month}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            statusMap[list.status as keyof typeof statusMap]
                              .variant as "outline" | "default" | "success"
                          }
                        >
                          {
                            statusMap[list.status as keyof typeof statusMap]
                              .label
                          }
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatToReais(list.preco_total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Confirmar Entrega</CardTitle>
              <CardDescription>
                {selectedList
                  ? `Confirmar entrega para ${selectedList.profissional.nome}`
                  : "Selecione uma lista para confirmar a entrega"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedList ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="photo">Foto dos Materiais</Label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    {photoFile && (
                      <p className="text-sm text-muted-foreground">
                        {photoFile.name}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="delivered"
                      checked={isDelivered}
                      onCheckedChange={(checked) =>
                        setIsDelivered(checked as boolean)
                      }
                    />
                    <Label htmlFor="delivered">
                      Confirmo que os materiais foram entregues
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observations">Observações (opcional)</Label>
                    <Textarea
                      id="observations"
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      placeholder="Adicione observações sobre a entrega..."
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleConfirmDelivery}
                    disabled={isUploading || !isDelivered || !photoFile}
                  >
                    {isUploading ? "Confirmando..." : "Confirmar Entrega"}
                  </Button>
                </>
              ) : (
                <p className="text-center text-muted-foreground">
                  Selecione uma lista para confirmar a entrega
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

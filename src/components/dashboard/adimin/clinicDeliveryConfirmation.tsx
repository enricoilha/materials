import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronDown, ChevronUp, Package, Camera, Loader2, X, AlertCircle } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import { capitalizeWords, formatToReais } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

// Type definitions
interface Clinic {
  id: number;
  sindicato: string | null;
  endereco: string | null;
}

interface Material {
  id: string;
  material_id: string;
  material_name: string;
  material_type: string | null;
  quantidade: number;
  preco: number;
  lista_id: string;
  professional_name: string;
}

interface DeliveryData {
  clinicId: number;
  photoUrl: string;
  observations: string;
  signatureUrl: string;
  missingItems: string[];
}

export const ClinicDeliveryConfirmation = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [observations, setObservations] = useState("");
  const [isDeliveryAgreed, setIsDeliveryAgreed] = useState(false);
  const [missingItems, setMissingItems] = useState<Set<string>>(new Set());
  const [expandedMaterials, setExpandedMaterials] = useState<Set<string>>(new Set());
  const [showCamera, setShowCamera] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const signaturePadRef = useRef<HTMLCanvasElement | null>(null);
  const signatureCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const supabase = createClientComponentClient();

  // Fetch clinics on component mount
  useEffect(() => {
    fetchClinics();
  }, []);

  // When a clinic is selected, fetch all materials for that clinic's lists
  useEffect(() => {
    if (selectedClinic) {
      fetchMaterialsForClinic(selectedClinic.id);
    }
  }, [selectedClinic]);

  // Filter materials based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMaterials(materials);
      return;
    }
    
    const normalizedSearch = searchTerm.toLowerCase();
    const filtered = materials.filter(material => 
      material.material_name.toLowerCase().includes(normalizedSearch) ||
      (material.material_type && material.material_type.toLowerCase().includes(normalizedSearch)) ||
      material.professional_name.toLowerCase().includes(normalizedSearch)
    );
    
    setFilteredMaterials(filtered);
  }, [searchTerm, materials]);

  // Initialize signature pad when it's shown
  useEffect(() => {
    if (showSignaturePad && signaturePadRef.current) {
      const canvas = signaturePadRef.current;
      const ctx = canvas.getContext('2d');
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
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';
        signatureCtxRef.current = ctx;
        
        // Clear canvas
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [showSignaturePad]);

  // Fetch all clinics
  const fetchClinics = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("clinicas")
        .select("*")
        .order("sindicato");

      if (error) throw error;
      setClinics(data || []);
    } catch (error) {
      console.error("Error fetching clinics:", error);
      toast.error("Não foi possível carregar as clínicas");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all materials for a clinic
  const fetchMaterialsForClinic = async (clinicId: number) => {
    try {
      setIsLoading(true);
      // First get all active lists for this clinic
      const { data: lists, error: listsError } = await supabase
        .from("listas")
        .select(`
          id,
          profissional_id,
          profissional:profissionais(nome)
        `)
        .eq("clinica_id", clinicId)
        .eq("status", "filled");

      if (listsError) throw listsError;

      if (!lists || lists.length === 0) {
        setMaterials([]);
        setFilteredMaterials([]);
        setIsLoading(false);
        return;
      }

      // Then get all materials from those lists
      const materialsPromises = lists.map(async (list) => {
        const { data: items, error: itemsError } = await supabase
          .from("lista_materiais_itens")
          .select(`
            id,
            lista_id,
            material_id,
            quantidade,
            preco,
            material:materiais(materiais, tipo)
          `)
          .eq("lista_id", list.id);

        if (itemsError) throw itemsError;
        
        return items?.map(item => ({
          id: item.id,
          lista_id: item.lista_id,
          material_id: item.material_id,
          material_name: item.material?.materiais || "Desconhecido",
          material_type: item.material?.tipo || null,
          quantidade: item.quantidade,
          preco: item.preco,
          professional_name: list.profissional?.nome || "Desconhecido"
        })) || [];
      });

      const materialsArrays = await Promise.all(materialsPromises);
      const allMaterials = materialsArrays.flat();
      
      setMaterials(allMaterials);
      setFilteredMaterials(allMaterials);
    } catch (error) {
      console.error("Error fetching materials:", error);
      toast.error("Não foi possível carregar os materiais");
    } finally {
      setIsLoading(false);
    }
  };

  // Group materials by type
  const groupedMaterials = filteredMaterials.reduce((groups, material) => {
    const type = material.material_type || "Sem categoria";
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(material);
    return groups;
  }, {} as Record<string, Material[]>);

  // Toggle material expansion
  const toggleMaterialExpansion = (materialType: string) => {
    const newExpanded = new Set(expandedMaterials);
    if (newExpanded.has(materialType)) {
      newExpanded.delete(materialType);
    } else {
      newExpanded.add(materialType);
    }
    setExpandedMaterials(newExpanded);
  };

  // Toggle missing item
  const toggleMissingItem = (materialId: string) => {
    const newMissingItems = new Set(missingItems);
    if (newMissingItems.has(materialId)) {
      newMissingItems.delete(materialId);
    } else {
      newMissingItems.add(materialId);
    }
    setMissingItems(newMissingItems);
  };

  // Handle file input change for delivery photo
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
      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
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
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error("Não foi possível acessar a câmera");
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "delivery-photo.jpg", { type: "image/jpeg" });
            setPhotoFile(file);
            setPhotoPreview(canvas.toDataURL('image/jpeg'));
            
            // Stop the camera stream
            const stream = video.srcObject as MediaStream;
            if (stream) {
              stream.getTracks().forEach(track => track.stop());
              video.srcObject = null;
            }
            
            setShowCamera(false);
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const closeCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
    setShowCamera(false);
  };

  // Start signature capture
  const startSignatureCapture = () => {
    setShowSignaturePad(true);
  };

  // Handle signature pad events
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!signatureCtxRef.current) return;
    
    signatureCtxRef.current.beginPath();
    
    // Get position based on event type
    let x, y;
    if ('touches' in e) {
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
      if ('touches' in moveEvent) {
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
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopDrawing);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', stopDrawing);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopDrawing);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', stopDrawing);
  };

  const clearSignature = () => {
    if (signaturePadRef.current && signatureCtxRef.current) {
      const canvas = signaturePadRef.current;
      signatureCtxRef.current.fillStyle = '#fff';
      signatureCtxRef.current.fillRect(0, 0, canvas.width, canvas.height);
      setSignatureData(null);
    }
  };

  const saveSignature = () => {
    if (signaturePadRef.current) {
      const dataUrl = signaturePadRef.current.toDataURL('image/png');
      setSignatureData(dataUrl);
      setShowSignaturePad(false);
    }
  };

  const cancelSignature = () => {
    setShowSignaturePad(false);
  };

  // Submit the delivery confirmation
  const handleSubmitDelivery = async () => {
    if (!selectedClinic) {
      toast.error("Selecione uma clínica");
      return;
    }

    if (!photoFile) {
      toast.error("Tire uma foto dos materiais");
      return;
    }

    if (!signatureData) {
      toast.error("É necessário uma assinatura");
      return;
    }

    if (!isDeliveryAgreed) {
      toast.error("Confirme que os materiais foram entregues");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload photo to storage
      const photoFilename = `delivery-photos/clinics/${selectedClinic.id}/${uuidv4()}.jpg`;
      const { error: photoUploadError } = await supabase.storage
        .from("confirmations")
        .upload(photoFilename, photoFile);

      if (photoUploadError) throw photoUploadError;

      // 2. Convert signature from data URL to file and upload
      const signatureFile = await dataURLtoFile(signatureData, 'signature.png');
      const signatureFilename = `signatures/clinics/${selectedClinic.id}/${uuidv4()}.png`;
      const { error: signatureUploadError } = await supabase.storage
        .from("confirmations")
        .upload(signatureFilename, signatureFile);

      if (signatureUploadError) throw signatureUploadError;

      // 3. Get public URLs for uploaded files
      const photoUrl = supabase.storage
        .from("confirmations")
        .getPublicUrl(photoFilename).data.publicUrl;

      const signatureUrl = supabase.storage
        .from("confirmations")
        .getPublicUrl(signatureFilename).data.publicUrl;

      // 4. Save delivery confirmation to database with missing items
      const missingItemsArray = Array.from(missingItems);
      const response = await fetch("/api/delivery/confirm-clinic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clinicId: selectedClinic.id,
          photoUrl,
          signatureUrl,
          observations,
          missingItems: missingItemsArray,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao confirmar entrega");
      }

      toast.success("Entrega confirmada com sucesso!");

      // Reset form
      setSelectedClinic(null);
      setPhotoFile(null);
      setPhotoPreview(null);
      setObservations("");
      setSignatureData(null);
      setIsDeliveryAgreed(false);
      setMissingItems(new Set());
      setMaterials([]);
      setFilteredMaterials([]);
      setExpandedMaterials(new Set());
      setSearchTerm("");
      
      // Refresh clinics list
      fetchClinics();
    } catch (error) {
      console.error("Error confirming delivery:", error);
      toast.error("Não foi possível confirmar a entrega");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to convert data URL to file
  const dataURLtoFile = async (dataUrl: string, filename: string): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: 'image/png' });
  };

  // Calculate total quantities and values
  const totalQuantity = filteredMaterials.reduce((sum, material) => sum + material.quantidade, 0);
  const totalValue = filteredMaterials.reduce(
    (sum, material) => sum + material.preco * material.quantidade, 
    0
  );
  const missingQuantity = filteredMaterials
    .filter(mat => missingItems.has(mat.id))
    .reduce((sum, mat) => sum + mat.quantidade, 0);
  const missingValue = filteredMaterials
    .filter(mat => missingItems.has(mat.id))
    .reduce((sum, mat) => sum + mat.preco * mat.quantidade, 0);

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto">
      <div className="flex flex-col space-y-4 p-4">
        {!selectedClinic ? (
          <Card>
            <CardHeader>
              <CardTitle>Confirmar Entrega de Materiais</CardTitle>
              <CardDescription>Selecione uma clínica para iniciar a confirmação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : clinics.length > 0 ? (
                  clinics.map((clinic) => (
                    <Button 
                      key={clinic.id}
                      variant="outline"
                      className="flex justify-between items-center h-auto py-4 px-4 text-left"
                      onClick={() => setSelectedClinic(clinic)}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-base">
                          {capitalizeWords(clinic.sindicato || "") || `Clínica ${clinic.id}`}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {capitalizeWords(clinic.endereco || "") || "Sem endereço"}
                        </span>
                      </div>
                      <ChevronDown className="h-5 w-5 opacity-70" />
                    </Button>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma clínica encontrada
                  </div>
                )}
              </CardContent>
            </Card>
            
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
                      onClick={() => setSignatureData(null)}
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelSignature}
                        >
                          Cancelar
                        </Button>
                        <span className="font-medium">Assinatura</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearSignature}
                        >
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
                        <Button
                          className="w-full"
                          onClick={saveSignature}
                        >
                          Salvar Assinatura
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">Observações</CardTitle>
                <CardDescription>
                  Adicione informações importantes sobre a entrega
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Descreva qualquer ocorrência ou observação relevante sobre a entrega..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Checkbox
                    id="delivery-agreed"
                    checked={isDeliveryAgreed}
                    onCheckedChange={(checked) => setIsDeliveryAgreed(!!checked)}
                  />
                  <Label
                    htmlFor="delivery-agreed"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Confirmo que realizei a conferência dos materiais e registrei corretamente os itens em falta
                  </Label>
                </div>
                
                <Button
                  className="w-full"
                  disabled={isSubmitting || !isDeliveryAgreed || !photoFile || !signatureData}
                  onClick={handleSubmitDelivery}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Confirmar Entrega"
                  )}
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default ClinicDeliveryConfirmation;
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-2">
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 p-2"
                onClick={() => setSelectedClinic(null)}
              >
                <ChevronDown className="h-5 w-5 rotate-90" />
                <span>Voltar</span>
              </Button>
              
              <h2 className="text-xl font-semibold">{capitalizeWords(selectedClinic.sindicato || "") || `Clínica ${selectedClinic.id}`}</h2>
              
              <div className="w-10"></div> {/* Spacer for alignment */}
            </div>
            
            <Card className="mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Lista de Materiais</CardTitle>
                <CardDescription>
                  Confirme todos os materiais que foram entregues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Buscar material..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-4"
                />
                
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredMaterials.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-between p-2 bg-muted rounded-md text-sm">
                      <div>
                        <span className="font-medium">Total de Itens:</span> {filteredMaterials.length}
                      </div>
                      <div>
                        <span className="font-medium">Quantidade:</span> {totalQuantity}
                      </div>
                      <div>
                        <span className="font-medium">Valor:</span> R$ {formatToReais(totalValue)}
                      </div>
                    </div>
                    
                    {Object.entries(groupedMaterials).map(([type, materialsInGroup]) => (
                      <div key={type} className="border rounded-md overflow-hidden">
                        <Button
                          variant="ghost"
                          className="w-full flex justify-between items-center px-4 py-3 h-auto"
                          onClick={() => toggleMaterialExpansion(type)}
                        >
                          <div className="flex items-center">
                            <Package className="h-5 w-5 mr-2 text-muted-foreground" />
                            <span className="font-medium">{type}</span>
                            <Badge variant="outline" className="ml-2">
                              {materialsInGroup.length}
                            </Badge>
                          </div>
                          {expandedMaterials.has(type) ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </Button>
                        
                        {expandedMaterials.has(type) && (
                          <div className="px-4 py-2 space-y-3">
                            {materialsInGroup.map((material) => (
                              <div 
                                key={material.id} 
                                className={`flex items-center justify-between p-2 rounded-md ${
                                  missingItems.has(material.id) ? 'bg-destructive/10' : 'hover:bg-accent'
                                }`}
                              >
                                <div className="flex items-center">
                                  <Checkbox
                                    id={`missing-${material.id}`}
                                    checked={missingItems.has(material.id)}
                                    onCheckedChange={() => toggleMissingItem(material.id)}
                                  />
                                  <div className="ml-3">
                                    <div className="font-medium">
                                      {capitalizeWords(material.material_name)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Para: {material.professional_name}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm">{material.quantidade}x</div>
                                  <div className="text-xs text-muted-foreground">
                                    R$ {formatToReais(material.preco * material.quantidade)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {missingItems.size > 0 && (
                      <div className="p-3 bg-destructive/10 rounded-md border border-destructive/20">
                        <div className="flex items-center gap-2 text-destructive mb-2">
                          <AlertCircle className="h-5 w-5" />
                          <span className="font-medium">Itens em Falta</span>
                        </div>
                        <div className="text-sm mb-2">
                          <span>{missingItems.size} itens marcados como faltantes (total de {missingQuantity} unidades)</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Valor total faltante: </span>
                          <span>R$ {formatToReais(missingValue)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "Nenhum material encontrado" : "Não há listas para esta clínica"}
                  </div>
                )}
              </CardContent>
            </Card>
            
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
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview(null);
                      }}
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
                    
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};


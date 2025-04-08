import React, { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

// Component imports
import { ClinicSelector } from "./clinic-selector";
import { ClinicHeader } from "./clinicHeader";
import { MaterialsList } from "./materialsList";
import { PhotoCapture } from "./photoCapture";
import { SignatureCapture } from "./signatureCapture";
import { DeliveryObservations } from "./deliveryObservations";
import { DeliveryConfirmButton } from "./deliveryConfirmButton";

// Type imports
import { Clinic, Material } from "./types";

// Utility functions
import { uploadPhotoToStorage, uploadSignatureToStorage } from "@/lib/utils";

export const ClinicDeliveryConfirmation: React.FC = () => {
  // State for clinics and selected clinic
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // State for materials
  const [materials, setMaterials] = useState<Material[]>([]);

  // State for form
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [observations, setObservations] = useState("");
  const [isDeliveryAgreed, setIsDeliveryAgreed] = useState(false);
  const [missingItems, setMissingItems] = useState<Set<string>>(new Set());

  // State for submission
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        .select(
          `
          id,
          profissional_id,
          profissional:profissionais(nome)
        `
        )
        .eq("clinica_id", clinicId)
        .eq("status", "filled");

      if (listsError) throw listsError;

      if (!lists || lists.length === 0) {
        setMaterials([]);
        setIsLoading(false);
        return;
      }

      // Then get all materials from those lists
      const materialsPromises = lists.map(async (list: any) => {
        const { data: items, error: itemsError } = await supabase
          .from("lista_materiais_itens")
          .select(
            `
            id,
            lista_id,
            material_id,
            quantidade,
            preco,
            material:materiais(materiais, tipo)
          `
          )
          .eq("lista_id", list.id);

        if (itemsError) throw itemsError;

        return (
          items?.map((item: any) => ({
            id: item.id,
            lista_id: item.lista_id,
            material_id: item.material_id,
            material_name: item.material?.materiais || "Desconhecido",
            material_type: item.material?.tipo || null,
            quantidade: item.quantidade,
            preco: item.preco,
            professional_name: list.profissional?.nome || "Desconhecido",
          })) || []
        );
      });

      const materialsArrays = await Promise.all(materialsPromises);
      const allMaterials = materialsArrays.flat();

      setMaterials(allMaterials);
    } catch (error) {
      console.error("Error fetching materials:", error);
      toast.error("Não foi possível carregar os materiais");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectClinic = (clinic: Clinic) => {
    setSelectedClinic(clinic);
  };

  const handleBackToSelection = () => {
    setSelectedClinic(null);
    resetForm();
  };

  const handleToggleMissing = (materialId: string) => {
    const newMissingItems = new Set(missingItems);
    if (newMissingItems.has(materialId)) {
      newMissingItems.delete(materialId);
    } else {
      newMissingItems.add(materialId);
    }
    setMissingItems(newMissingItems);
  };

  const handleCapturePhoto = (file: File, preview: string) => {
    setPhotoFile(file);
    setPhotoPreview(preview);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  // Handler for capturing a signature
  const handleCaptureSignature = (data: string) => {
    setSignatureData(data);
  };

  // Handler for removing a signature
  const handleRemoveSignature = () => {
    setSignatureData(null);
  };

  // Handler for updating observations
  const handleObservationsChange = (value: string) => {
    setObservations(value);
  };

  // Handler for agreement checkbox
  const handleAgreementChange = (checked: boolean) => {
    setIsDeliveryAgreed(checked);
  };

  // Check if the form is valid
  const isFormValid = () => {
    return !!photoFile && !!signatureData;
  };

  // Reset form to initial state
  const resetForm = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setSignatureData(null);
    setObservations("");
    setIsDeliveryAgreed(false);
    setMissingItems(new Set());
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
      const photoFilename = `${uuidv4()}.jpg`;
      const photoUrl = await uploadPhotoToStorage(
        photoFile,
        selectedClinic.id,
        photoFilename
      );

      // 2. Upload signature to storage
      const signatureFilename = `${uuidv4()}.png`;
      const signatureUrl = await uploadSignatureToStorage(
        signatureData,
        selectedClinic.id,
        signatureFilename
      );

      // 3. Save delivery confirmation to database with missing items
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

      // Reset form and go back to clinic selection
      setSelectedClinic(null);
      resetForm();

      // Refresh clinics list
      fetchClinics();
    } catch (error) {
      console.error("Error confirming delivery:", error);
      toast.error("Não foi possível confirmar a entrega");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto">
      <div className="flex flex-col space-y-4 p-4">
        {!selectedClinic ? (
          <ClinicSelector
            clinics={clinics}
            isLoading={isLoading}
            onSelectClinic={handleSelectClinic}
          />
        ) : (
          <>
            <ClinicHeader
              clinic={selectedClinic}
              onBack={handleBackToSelection}
            />

            <MaterialsList
              materials={materials}
              isLoading={isLoading}
              missingItems={missingItems}
              onToggleMissing={handleToggleMissing}
            />

            <PhotoCapture
              photoPreview={photoPreview}
              onCapturePhoto={handleCapturePhoto}
              onRemovePhoto={handleRemovePhoto}
            />

            <SignatureCapture
              signatureData={signatureData}
              onCaptureSignature={handleCaptureSignature}
              onRemoveSignature={handleRemoveSignature}
            />

            <DeliveryObservations
              observations={observations}
              onObservationsChange={handleObservationsChange}
            />

            <DeliveryConfirmButton
              isDeliveryAgreed={isDeliveryAgreed}
              isSubmitting={isSubmitting}
              isFormValid={isFormValid()}
              onAgreementChange={handleAgreementChange}
              onSubmit={handleSubmitDelivery}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ClinicDeliveryConfirmation;

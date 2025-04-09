import React, { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { ClinicSelector } from "./clinic-selector";
import { ClinicHeader } from "./clinicHeader";
import { MaterialsList } from "./materialsList";
import { PhotoCapture } from "./photoCapture";
import { SignatureCapture } from "./signatureCapture";
import { DeliveryObservations } from "./deliveryObservations";
import { DeliveryConfirmButton } from "./deliveryConfirmButton";
import { Clinic, Material } from "./types";
import { uploadPhotoToStorage, uploadSignatureToStorage } from "@/lib/utils";

export const ClinicDeliveryConfirmation: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [materials, setMaterials] = useState<Material[]>([]);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [observations, setObservations] = useState("");
  const [isDeliveryAgreed, setIsDeliveryAgreed] = useState(false);
  const [missingItems, setMissingItems] = useState<Set<string>>(new Set());

  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchClinics();
  }, []);

  useEffect(() => {
    if (selectedClinic) {
      fetchMaterialsForClinic(selectedClinic.id);
    }
  }, [selectedClinic]);

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

  const fetchMaterialsForClinic = async (clinicId: number) => {
    try {
      setIsLoading(true);
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

  const handleCaptureSignature = (data: string) => {
    setSignatureData(data);
  };

  const handleRemoveSignature = () => {
    setSignatureData(null);
  };

  const handleObservationsChange = (value: string) => {
    setObservations(value);
  };

  const handleAgreementChange = (checked: boolean) => {
    setIsDeliveryAgreed(checked);
  };

  const isFormValid = () => {
    return !!photoFile && !!signatureData;
  };

  const resetForm = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setSignatureData(null);
    setObservations("");
    setIsDeliveryAgreed(false);
    setMissingItems(new Set());
  };

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
      const photoFilename = `${uuidv4()}.jpg`;
      const photoUrl = await uploadPhotoToStorage(
        photoFile,
        selectedClinic.id,
        photoFilename
      );

      const signatureFilename = `${uuidv4()}.png`;
      const signatureUrl = await uploadSignatureToStorage(
        signatureData,
        selectedClinic.id,
        signatureFilename
      );

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

      setSelectedClinic(null);
      resetForm();

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

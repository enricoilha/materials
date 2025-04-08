// Shared types for clinic delivery components

export interface Clinic {
    id: number;
    sindicato: string | null;
    endereco: string | null;
}

export interface Material {
    id: string;
    material_id: string;
    material_name: string;
    material_type: string | null;
    quantidade: number;
    preco: number;
    lista_id: string;
    professional_name: string;
}

export interface GroupedMaterials {
    [key: string]: Material[];
}

export interface DeliveryData {
    clinicId: number;
    photoUrl: string;
    observations: string;
    signatureUrl: string;
    missingItems: string[];
}

export interface DeliveryFormState {
    photoFile: File | null;
    photoPreview: string | null;
    signatureData: string | null;
    observations: string;
    isDeliveryAgreed: boolean;
    missingItems: Set<string>;
}

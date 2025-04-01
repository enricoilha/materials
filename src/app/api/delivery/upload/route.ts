import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const listaId = formData.get("listaId") as string;

        if (!file || !listaId) {
            return NextResponse.json(
                { error: "Arquivo e ID da lista são obrigatórios" },
                { status: 400 },
            );
        }

        // Generate unique filename
        const fileExt = file.name.split(".").pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `delivery-photos/${listaId}/${fileName}`;

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("materials")
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from("materials")
            .getPublicUrl(filePath);

        // Save delivery confirmation in database
        const { error: dbError } = await supabase
            .from("delivery_confirmations")
            .insert({
                lista_id: listaId,
                photo_url: publicUrl,
                confirmed_at: new Date().toISOString(),
            });

        if (dbError) {
            throw dbError;
        }

        return NextResponse.json({ photoUrl: publicUrl });
    } catch (error) {
        console.error("Erro ao fazer upload da foto:", error);
        return NextResponse.json(
            { error: "Erro ao fazer upload da foto" },
            { status: 500 },
        );
    }
}

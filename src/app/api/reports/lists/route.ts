import { createClientServer } from "@/lib/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createClientServer();

        // Check if user is authenticated and is an admin
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (session.user.user_metadata.role !== "admin") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Fetch all lists with professional information
        const { data: lists, error } = await supabase
            .from("listas")
            .select(`
                id,
                month,
                status,
                preco_total,
                created_at,
                filled_at,
                profissional:profissionais (
                    id,
                    nome,
                    funcao,
                    clinica,
                    sindicato,
                    email,
                    telefone
                )
            `)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching lists:", error);
            return new NextResponse("Internal Server Error", { status: 500 });
        }

        return NextResponse.json(lists);
    } catch (error) {
        console.error("Error in lists route:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

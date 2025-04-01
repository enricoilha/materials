import { createClientServer } from "@/lib/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClientServer();
        const { listaId, photoUrl, observations } = await request.json();

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

        // Create delivery confirmation
        const { error: confirmationError } = await supabase
            .from("delivery_confirmations")
            .insert({
                lista_id: listaId,
                photo_url: photoUrl,
                observations,
                confirmed_by: session.user.id,
            });

        if (confirmationError) {
            console.error(
                "Error creating delivery confirmation:",
                confirmationError,
            );
            return new NextResponse("Internal Server Error", { status: 500 });
        }

        // Update list status to delivered
        const { error: updateError } = await supabase
            .from("listas")
            .update({ status: "delivered" })
            .eq("id", listaId);

        if (updateError) {
            console.error("Error updating list status:", updateError);
            return new NextResponse("Internal Server Error", { status: 500 });
        }

        return new NextResponse("Delivery confirmed successfully", {
            status: 200,
        });
    } catch (error) {
        console.error("Error in delivery confirmation:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

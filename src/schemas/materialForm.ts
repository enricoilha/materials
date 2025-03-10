import { z } from "zod";

export const materialSchema = z.object({
  materials: z.array(
    z.object({
      material_id: z.string({ required_error: "Campo obrigatório" }),
      quantity: z
        .number({ required_error: "Campo obrigatório" })
        .min(1, "Insira um número válido"),
      preco: z.number({ required_error: "Campo obrigatório" }),
    })
  ),
});

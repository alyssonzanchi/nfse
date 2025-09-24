"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type ActionState } from "@/lib/definitions";

const imovelSchema = z.object({
  endereco: z.string().min(5, "O endereço é obrigatório."),
  cod_loc: z.coerce.number().min(1, "O código de locação é obrigatório."),
  tomadorId: z.coerce.number().min(1, "Selecione um proprietário."),
});

export async function createImovel(prevState: ActionState, formData: FormData) {
  const validatedFields = imovelSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Erro de validação.",
    };
  }

  try {
    await prisma.imovel.create({
      data: validatedFields.data,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return {
      message: "Erro no banco de dados: Não foi possível criar o imóvel.",
    };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

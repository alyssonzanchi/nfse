"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const proprietarioSchema = z.object({
  nome_razao_social: z.string().min(3, "O nome é obrigatório."),
  cpf_cnpj: z.string().min(11, "O CPF/CNPJ é obrigatório."),
  type: z.enum(["F", "J"]),
  logradouro: z.string().min(3, "O logradouro é obrigatório."),
  complemento: z.string().optional(),
  bairro: z.string().min(3, "O bairro é obrigatório."),
  cod_cidade: z.coerce.number().min(1, "O código da cidade é obrigatório."),
  cep: z.string().min(8, "O CEP é obrigatório."),
  email: z.string().email("Email inválido.").optional().or(z.literal("")),
});

export type State = {
  errors?: {
    [key: string]: string[];
  };
  message?: string | null;
};

export async function createProprietario(prevState: State, formData: FormData) {
  const validatedFields = proprietarioSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Erro de validação. Por favor, corrija os campos.",
    };
  }

  try {
    await prisma.tomador.create({
      data: validatedFields.data,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return {
      message: "Erro no banco de dados: Não foi possível criar o proprietário.",
    };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

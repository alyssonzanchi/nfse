"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createImovel } from "@/app/(main)/imoveis/actions";
import { type ActionState } from "@/lib/definitions";
import { Tomador } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="mt-4 cursor-pointer">
      {pending ? "Salvando..." : "Salvar Imóvel"}
    </Button>
  );
}

interface ImovelFormProps {
  proprietarios: Tomador[];
}

export default function ImovelForm({ proprietarios }: ImovelFormProps) {
  const initialState: ActionState = { message: null, errors: {} };
  const [state, dispatch] = useActionState(createImovel, initialState);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Novo Imóvel</CardTitle>
        <CardDescription>
          Preencha os dados para cadastrar um novo imóvel.
        </CardDescription>
      </CardHeader>
      <form action={dispatch}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="tomadorId" className="mb-2">
              Proprietário
            </Label>
            <Select name="tomadorId" required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um proprietário..." />
              </SelectTrigger>
              <SelectContent>
                {proprietarios.map((prop) => (
                  <SelectItem key={prop.id} value={String(prop.id)}>
                    {prop.nome_razao_social}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.tomadorId && (
              <p className="text-sm text-red-500">
                {state.errors.tomadorId[0]}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="endereco">Endereço</Label>
            <Input id="endereco" name="endereco" required className="mt-2" />
            {state.errors?.endereco && (
              <p className="text-sm text-red-500">{state.errors.endereco[0]}</p>
            )}
          </div>
          <div>
            <Label htmlFor="cod_loc">Código da Cidade</Label>
            <Input
              id="cod_loc"
              name="cod_loc"
              type="number"
              required
              className="mt-2"
            />
            {state.errors?.cod_loc && (
              <p className="text-sm text-red-500">{state.errors.cod_loc[0]}</p>
            )}
          </div>
          {state.message && (
            <p className="text-sm text-red-500">{state.message}</p>
          )}
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}

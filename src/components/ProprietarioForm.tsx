"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createProprietario, State } from "@/app/(main)/proprietarios/actions";
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
      {pending ? "Salvando..." : "Salvar Proprietário"}
    </Button>
  );
}

export default function ProprietarioForm() {
  const initialState: State = { message: null, errors: {} };
  const [state, dispatch] = useActionState(createProprietario, initialState);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Novo Proprietário</CardTitle>
        <CardDescription>
          Preencha os dados para cadastrar um novo proprietário.
        </CardDescription>
      </CardHeader>
      <form action={dispatch}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome_razao_social">Nome / Razão Social</Label>
              <Input
                id="nome_razao_social"
                name="nome_razao_social"
                required
                className="mt-2"
              />
              {state.errors?.nome_razao_social && (
                <p className="text-sm text-red-500">
                  {state.errors.nome_razao_social[0]}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="cpf_cnpj">CPF / CNPJ</Label>
              <Input id="cpf_cnpj" name="cpf_cnpj" required className="mt-2" />
              {state.errors?.cpf_cnpj && (
                <p className="text-sm text-red-500">
                  {state.errors.cpf_cnpj[0]}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="type" className="mb-2">
                Tipo
              </Label>
              <Select name="type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="F">Pessoa Física</SelectItem>
                  <SelectItem value="J">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="email">Email (Opcional)</Label>
              <Input id="email" name="email" type="email" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="logradouro">Logradouro</Label>
              <Input
                id="logradouro"
                name="logradouro"
                required
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="complemento">Complemento (Opcional)</Label>
              <Input id="complemento" name="complemento" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="bairro">Bairro</Label>
              <Input id="bairro" name="bairro" required className="mt-2" />
            </div>
            <div>
              <Label htmlFor="cod_cidade">Código da Cidade</Label>
              <Input
                id="cod_cidade"
                name="cod_cidade"
                type="number"
                required
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="cep">CEP</Label>
              <Input id="cep" name="cep" required className="mt-2" />
            </div>
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

"use client";

import { ChangeEvent, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import Link from "next/link";

import { Table } from "@/components/table/table";
import { TableHeader } from "@/components/table/table-header";
import { TableRow } from "@/components/table/table-row";
import { TableCell } from "@/components/table/table-cell";
import { IconButton } from "@/components/IconButton";

import { ImovelComTomador } from "@/app/(main)/dashboard/page";
import { gerarNotaFiscalAction } from "@/app/(main)/dashboard/actions";

interface DashboardClientProps {
  imoveis: ImovelComTomador[];
  total: number;
  page: number;
  totalPages: number;
  search: string;
}

export default function DashboardClient({
  imoveis,
  total,
  page,
  totalPages,
}: DashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [inputValues, setInputValues] = useState<{ [key: number]: string }>({});

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    router.push(`/dashboard?${params.toString()}`);
  };

  const handleValueChange = (imovelId: number, value: string) => {
    setInputValues((prev) => ({ ...prev, [imovelId]: value }));
  };

  const handleGenerateClick = (imovelId: number) => {
    const value = inputValues[imovelId];
    if (!value) {
      toast.error("Erro de Validação", {
        description: "Por favor, insira um valor antes de enviar.",
      });
      return;
    }

    startTransition(async () => {
      const result = await gerarNotaFiscalAction(imovelId, value);
      if (result.success) {
        toast.success("Sucesso!", { description: result.message });
      } else {
        toast.error("Falha na Operação", { description: result.message });
      }
    });
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams);
    params.set("search", event.target.value);
    params.set("page", "1");
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <>
      {imoveis.length > 0 ? (
        <div className="flex flex-col gap-5">
          <Toaster richColors />
          <div className="flex gap-3 items-center py-4">
            <h1 className="text-2xl font-bold">Proprietários</h1>
            <div className="px-3 py-1.5 border border-white/10 rounded-lg w-72 flex items-center gap-3">
              <Search className="size-4 text-red-500" />
              <input
                onChange={handleSearchChange}
                className="bg-transparent flex-1 outline-none border-0 p-0 text-sm focus:ring-0"
                placeholder="Buscar proprietário..."
              />
            </div>
          </div>

          <Table>
            <thead>
              <tr className="border-b border-white/10">
                <TableHeader>Proprietário</TableHeader>
                <TableHeader>Imóvel</TableHeader>
                <TableHeader>Valor</TableHeader>
                <TableHeader style={{ width: 64 }}></TableHeader>
              </tr>
            </thead>
            <tbody>
              {imoveis.map((imovel) => (
                <TableRow key={imovel.id}>
                  <TableCell>{imovel.tomador.nome_razao_social}</TableCell>
                  <TableCell>{imovel.endereco}</TableCell>
                  <TableCell>
                    <input
                      key={imovel.id}
                      type="text"
                      value={inputValues[imovel.id] || ""}
                      onChange={(e) =>
                        handleValueChange(imovel.id, e.target.value)
                      }
                      className="w-32 bg-transparent outline-none border border-white/10 rounded-lg px-3 py-1.5 gap-3 text-sm focus:ring-0"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleGenerateClick(imovel.id)}
                      style={{ width: 64 }}
                    >
                      Enviar
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Mostrando {imoveis.length} de {total} itens
            </div>
            <div className="flex items-center gap-6">
              <span>
                Página {page} de {totalPages}
              </span>
              <div className="flex gap-1.5">
                <IconButton onClick={() => goToPage(1)} disabled={page === 1}>
                  <ChevronsLeft className="size-4" />
                </IconButton>

                <IconButton
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="size-4" />
                </IconButton>

                <IconButton
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="size-4" />
                </IconButton>

                <IconButton
                  onClick={() => goToPage(totalPages)}
                  disabled={page === totalPages}
                >
                  <ChevronsRight className="size-4" />
                </IconButton>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-zinc-50 py-10">
          <p className="font-medium">Nenhum imóvel encontrado.</p>
          <p className="text-sm mt-2">
            Que tal cadastrar um novo{" "}
            <Link href="/imoveis/novo" className="underline">
              imóvel
            </Link>
            ?
          </p>
        </div>
      )}
    </>
  );
}

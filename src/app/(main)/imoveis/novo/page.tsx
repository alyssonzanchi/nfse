import ImovelForm from "@/components/ImovelForm";
import prisma from "@/lib/prisma";

export default async function NovoImovelPage() {
  const proprietarios = await prisma.tomador.findMany({
    orderBy: { nome_razao_social: "asc" },
  });

  return (
    <div className="p-4">
      <ImovelForm proprietarios={proprietarios} />
    </div>
  );
}

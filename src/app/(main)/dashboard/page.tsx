import prisma from "@/lib/prisma";
import DashboardClient from "@/components/DashboardClient";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export type ImovelComTomador = {
  id: number;
  cod_loc: number;
  endereco: string;
  tomador: {
    id: number;
    nome_razao_social: string;
  };
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string | string[] | undefined;
    search?: string | string[] | undefined;
  }>;
}) {
  const resolved = await searchParams;
  const rawPage = resolved.page;
  const rawSearch = resolved.search;

  const page =
    typeof rawPage === "string"
      ? Number(rawPage)
      : Array.isArray(rawPage)
      ? Number(rawPage[0])
      : 1;

  const search =
    typeof rawSearch === "string"
      ? rawSearch
      : Array.isArray(rawSearch)
      ? rawSearch[0]
      : "";
      
  const limit = 10;

  const whereClause: Prisma.ImovelWhereInput = {};

  if (search) {
    whereClause.tomador = {
      nome_razao_social: {
        contains: search,
        mode: "insensitive",
      },
    };
  }

  const [imoveis, total] = await Promise.all([
    prisma.imovel.findMany({
      where: whereClause,
      take: limit,
      skip: (page - 1) * limit,
      include: {
        tomador: {
          select: {
            id: true,
            nome_razao_social: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    }),
    prisma.imovel.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <DashboardClient
      imoveis={imoveis as ImovelComTomador[]}
      total={total}
      page={page}
      totalPages={totalPages}
      search={search}
    />
  );
}

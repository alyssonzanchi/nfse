-- CreateEnum
CREATE TYPE "public"."Type" AS ENUM ('F', 'J');

-- CreateTable
CREATE TABLE "public"."Tomador" (
    "id" SERIAL NOT NULL,
    "type" "public"."Type" NOT NULL,
    "cpf_cnpj" TEXT NOT NULL,
    "nome_razao_social" TEXT NOT NULL,
    "logradouro" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "cod_cidade" INTEGER NOT NULL,
    "cep" TEXT NOT NULL,
    "email" TEXT,

    CONSTRAINT "Tomador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Imovel" (
    "id" SERIAL NOT NULL,
    "cod_loc" INTEGER NOT NULL,
    "endereco" TEXT NOT NULL,
    "tomadorId" INTEGER NOT NULL,

    CONSTRAINT "Imovel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tomador_cpf_cnpj_key" ON "public"."Tomador"("cpf_cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."Imovel" ADD CONSTRAINT "Imovel_tomadorId_fkey" FOREIGN KEY ("tomadorId") REFERENCES "public"."Tomador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

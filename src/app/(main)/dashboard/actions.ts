"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import axios from "axios";
import FormData from "form-data";

function escapeXml(unsafe: string | null | undefined): string {
  if (unsafe === null || unsafe === undefined) {
    return "";
  }
  return unsafe.replace(/&/g, "&amp;");
}

export async function gerarNotaFiscalAction(imovelId: number, valor: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, message: "Usuário não autenticado." };
  }

  if (!imovelId || !valor) {
    return {
      success: false,
      message: "ID do imóvel e valor são obrigatórios.",
    };
  }

  try {
    const imovel = await prisma.imovel.findUnique({
      where: { id: imovelId },
      include: {
        tomador: true,
      },
    });

    if (!imovel || !imovel.tomador) {
      return { success: false, message: "Imóvel ou tomador não encontrado." };
    }
    const { tomador } = imovel;

    const cidadeNomeUrl = process.env.CIDADE_PRESTADOR_NOME;
    const cidadeCodigoTom = process.env.CIDADE_PRESTADOR;
    const login = process.env.LOGIN;
    const senha = process.env.SENHA;

    const data = `<?xml version="1.0" encoding="ISO-8859-1"?>
<nfse>
<nf>
    <valor_total>${valor}</valor_total>
    <valor_desconto>0,00</valor_desconto>
    <valor_ir>0,00</valor_ir>
    <valor_inss>0,00</valor_inss>
    <valor_contribuicao_social>0,00</valor_contribuicao_social>
    <valor_rps>0,00</valor_rps>
    <valor_pis>0,00</valor_pis>
    <valor_cofins>0,00</valor_cofins>
    <observacao>IMOVEL: ${imovel.endereco}</observacao>
</nf>
<prestador>
    <cpfcnpj>${login}</cpfcnpj>
    <cidade>${cidadeCodigoTom}</cidade>
</prestador>
<tomador>
    <tipo>${tomador.type}</tipo>
    <cpfcnpj>${tomador.cpf_cnpj}</cpfcnpj>
    <nome_razao_social>${escapeXml(
      tomador.nome_razao_social
    )}</nome_razao_social>
    <logradouro>${tomador.logradouro}</logradouro>
    <email>${tomador.email ?? ""}</email>
    <complemento>${tomador.complemento ?? ""}</complemento>
    <bairro>${tomador.bairro}</bairro>
    <cidade>${tomador.cod_cidade}</cidade>
    <cep>${tomador.cep}</cep>
</tomador>
<itens>
    <lista>
    <codigo_local_prestacao_servico>${
      imovel.cod_loc
    }</codigo_local_prestacao_servico>
    <codigo_atividade>${process.env.COD_ATIVIDADE}</codigo_atividade>
    <codigo_item_lista_servico>${
      process.env.COD_SERVICO
    }</codigo_item_lista_servico>
    <descritivo>${process.env.DESCRICAO}</descritivo>
    <aliquota_item_lista_servico>${
      process.env.ALIQUOTA
    }</aliquota_item_lista_servico>
    <situacao_tributaria>0</situacao_tributaria>
    <valor_tributavel>${valor}</valor_tributavel>
    <valor_deducao>0,00</valor_deducao>
    <valor_issrf>0,00</valor_issrf>
    <tributa_municipio_prestador>S</tributa_municipio_prestador>
    <unidade_codigo/>
    <unidade_quantidade/>
    <unidade_valor_unitario/>
    </lista>
</itens>
<produtos>
</produtos>
</nfse>
`;

    const formData = new FormData();

    const xmlBuffer = Buffer.from(data, "latin1");
    formData.append("f1", xmlBuffer, { filename: `imovel_${imovelId}.xml` });

    const authHeader = `Basic ${Buffer.from(`${login}:${senha}`).toString(
      "base64"
    )}`;

    const apiUrl = `https://${cidadeNomeUrl}.atende.net/atende.php?pg=rest&service=WNERestServiceNFSe&cidade=padrao`;

    const response = await axios.post(apiUrl, formData, {
      headers: { ...formData.getHeaders(), Authorization: authHeader },
    });

    const responseDataString = String(response.data);

    if (responseDataString.includes("00001 - Sucesso")) {
      return {
        success: true,
        message: "Nota Fiscal gerada e enviada com sucesso!",
      };
    } else {
      const errorMatch = responseDataString.match(/<codigo>([^<]+)<\/codigo>/);
      const cleanErrorMessage = errorMatch
        ? errorMatch[1].replace(/\[\d+\]\s*-\s*/, "")
        : "A API externa retornou um erro desconhecido.";

      return {
        success: false,
        message: cleanErrorMessage,
      };
    }
  } catch (error: unknown) {
    console.error("Erro ao gerar nota fiscal:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("Data:", error.response.data);
      console.error("Status:", error.response.status);
    }
    return { success: false, message: "Ocorreu um erro interno no servidor." };
  }
}

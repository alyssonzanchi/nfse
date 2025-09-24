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
    <cpfcnpj>${process.env.LOGIN}</cpfcnpj>
    <cidade>${process.env.CIDADE_PRESTADOR}</cidade>
</prestador>
<tomador>
    <tipo>${tomador.type}</tipo>
    <cpfcnpj>${tomador.cpf_cnpj}</cpfcnpj>
    <ie></ie>
    <nome_razao_social>${escapeXml(
      tomador.nome_razao_social
    )}</nome_razao_social>
    <sobrenome_nome_fantasia></sobrenome_nome_fantasia>
    <logradouro>${tomador.logradouro}</logradouro>
    <email>${tomador.email ?? ""}</email>
    <complemento>${tomador.complemento ?? ""}</complemento>
    <ponto_referencia></ponto_referencia>
    <bairro>${tomador.bairro}</bairro>
    <cidade>${tomador.cod_cidade}</cidade>
    <cep>${tomador.cep}</cep>
    <ddd_fone_comercial></ddd_fone_comercial>
    <fone_comercial></fone_comercial>
    <ddd_fone_residencial></ddd_fone_residencial>
    <fone_residencial></fone_residencial>
    <ddd_fax></ddd_fax>
    <fone_fax></fone_fax>
</tomador>
<itens>
    <lista>
    <codigo_local_prestacao_servico>${
      imovel.cod_loc
    }</codigo_local_prestacao_servico>
    <codigo_item_lista_servico>${
      process.env.COD_SERVICO
    }</codigo_item_lista_servico>
    <descritivo>${process.env.DESCRICAO}</descritivo>
    <aliquota_item_lista_servico>${
      process.env.ALIQUOTA
    }</aliquota_item_lista_servico>
    <situacao_tributaria>00</situacao_tributaria>
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
    formData.append("login", process.env.LOGIN);
    formData.append("senha", process.env.SENHA);

    const xmlBuffer = Buffer.from(data, "latin1");
    formData.append("f1", xmlBuffer, { filename: `imovel_${imovelId}.xml` });

    const response = await axios.post(
      "http://sync.nfs-e.net/datacenter/include/nfw/importa_nfw/nfw_import_upload.php",
      formData,
      { headers: formData.getHeaders() }
    );

    const responseDataString = String(response.data);

    if (responseDataString.includes("<title>Nota Fiscal de Servi")) {
      return {
        success: true,
        message: "Nota Fiscal gerada e enviada com sucesso!",
      };
    } else {
      const errorMatch = responseDataString.match(/<li[^>]*>([^<]+)<\/li>/);
      const cleanErrorMessage = errorMatch
        ? errorMatch[1]
        : "A API externa retornou um erro desconhecido.";

      return {
        success: false,
        message: cleanErrorMessage,
      };
    }
  } catch (error) {
    console.error("Erro ao gerar nota fiscal:", error);
    return { success: false, message: "Ocorreu um erro interno no servidor." };
  }
}

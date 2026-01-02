-- CreateTable
CREATE TABLE "Lead" (
    "id" SERIAL NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nome" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "email" TEXT,
    "cpf" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NOVO',
    "tipo_seguro" TEXT,
    "placa" TEXT,
    "modelo_veiculo" TEXT,
    "ano_veiculo" TEXT,
    "uso_veiculo" TEXT,
    "link_pasta" TEXT,
    "dados_extras" JSONB,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

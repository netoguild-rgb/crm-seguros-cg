// ARQUIVO: index.js
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

// Rota padrão
app.get('/', (req, res) => {
  res.send('API do Typebot CRM rodando! 🚀');
});

// --- ROTA PARA RECEBER DADOS DO TYPEBOT ---
app.post('/leads', async (req, res) => {
  try {
    const dados = req.body;

    console.log("Recebendo Lead do Typebot:", dados.nome || dados.Nome_completo);

    // Mapeando as variáveis do Typebot para o Banco de Dados
    const lead = await prisma.lead.create({
      data: {
        // Dados Pessoais (Prioriza um, se não tiver, tenta o outro)
        nome:           dados.nome || dados.Nome_completo || "Sem Nome",
        whatsapp:       dados.whatsapp || dados.telefone || "Sem Whats",
        profissao:      dados.profissao,
        idade_condutor: dados.idade_do_condutor || dados.idades_saude,
        
        // Dados Gerais
        tipo_seguro:    dados.tipo_seguro,
        obs_final:      dados.obs_final,

        // Auto
        renavan:             dados.renavan,
        placa:               dados.placa,
        ano_veiculo:         dados.ano_do_veiculo,
        modelo_veiculo:      dados.modelo_veiculo,
        uso_veiculo:         dados.uso_veiculo,
        condutor_principal:  dados.condutor_principal,
        cobertura_roubo:     dados.cobertura_roubo,
        cobertura_terceiros: dados.cobertura_terceiros,
        carro_reserva:       dados.carro_reserva,
        km_guincho:          dados.km_guincho,

        // Vida
        capital_vida:   dados.capital_vida,
        motivo_vida:    dados.motivo_vida,

        // Saúde
        preferencia_rede: dados.preferencia_rede,
        plano_saude:      dados.plano_saude
      }
    });

    res.json({ mensagem: "Lead salvo com sucesso!", id: lead.id });

  } catch (error) {
    console.error("Erro ao salvar:", error);
    res.status(500).json({ error: 'Erro ao salvar lead', detalhe: error.message });
  }
});

// Rota para ver os Leads no seu Frontend
app.get('/leads', async (req, res) => {
  const leads = await prisma.lead.findMany({
    orderBy: { criadoEm: 'desc' }
  });
  res.json(leads);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Servidor pronto para o Typebot na porta ${PORT}`);
});
// ARQUIVO: backend/index.js
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

// Rota padrão
app.get('/', (req, res) => res.send('API CRM Seguros - Online 🚀'));

// 1. RECEBER LEAD (Do Typebot)
app.post('/leads', async (req, res) => {
  try {
    const dados = req.body;
    console.log("Novo Lead:", dados.nome || dados.Nome_completo);

    const lead = await prisma.lead.create({
      data: {
        nome:           dados.nome || dados.Nome_completo || "Sem Nome",
        whatsapp:       dados.whatsapp || dados.telefone || "Sem Whats",
        profissao:      dados.profissao,
        idade_condutor: dados.idade_do_condutor || dados.idades_saude,
        tipo_seguro:    dados.tipo_seguro,
        obs_final:      dados.obs_final,
        renavan:        dados.renavan,
        placa:          dados.placa,
        ano_veiculo:    dados.ano_do_veiculo,
        modelo_veiculo: dados.modelo_veiculo,
        uso_veiculo:    dados.uso_veiculo,
        condutor_principal: dados.condutor_principal,
        cobertura_roubo:    dados.cobertura_roubo,
        cobertura_terceiros:dados.cobertura_terceiros,
        carro_reserva:      dados.carro_reserva,
        km_guincho:         dados.km_guincho,
        capital_vida:   dados.capital_vida,
        motivo_vida:    dados.motivo_vida,
        preferencia_rede: dados.preferencia_rede,
        plano_saude:      dados.plano_saude,
        status:           "NOVO" // Todo lead chega como NOVO
      }
    });
    res.json({ mensagem: "Salvo!", id: lead.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao salvar' });
  }
});

// 2. LISTAR LEADS
app.get('/leads', async (req, res) => {
  const leads = await prisma.lead.findMany({ orderBy: { criadoEm: 'desc' } });
  res.json(leads);
});

// 3. ATUALIZAR STATUS (Para gestão de campanha)
app.patch('/leads/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const lead = await prisma.lead.update({
      where: { id: Number(id) },
      data: { status }
    });
    res.json(lead);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar' });
  }
});

// 4. DELETAR LEAD (Limpar banco)
app.delete('/leads/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.lead.delete({ where: { id: Number(id) } });
    res.json({ mensagem: "Lead deletado" });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao deletar' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 Servidor na porta ${PORT}`));
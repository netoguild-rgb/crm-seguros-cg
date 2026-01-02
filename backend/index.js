// ARQUIVO: backend/index.js

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors()); 

// Rota de Teste
app.get('/', (req, res) => res.send('CRM Seguros API - Rodando 🚀'));

// 1. CRIAR LEAD
app.post('/leads', async (req, res) => {
  try {
    const dados = req.body;
    console.log("Recebendo:", dados.nome || "Lead sem nome");

    let whatsLimpo = "00000000000";
    if (dados.whatsapp || dados.telefone) {
        whatsLimpo = (dados.whatsapp || dados.telefone).toString().replace(/\D/g, '');
    }

    const lead = await prisma.lead.create({
      data: {
        nome:           dados.nome || dados.Nome_completo || dados.name || "Sem Nome",
        whatsapp:       whatsLimpo,
        email:          dados.email || dados.mail,
        cpf:            dados.cpf,
        status:         "NOVO",
        
        tipo_seguro:    dados.tipo_seguro,
        placa:          dados.placa,
        modelo_veiculo: dados.modelo_veiculo,
        ano_veiculo:    dados.ano_do_veiculo || dados.ano_veiculo,
        
        // RECEBE O LINK DA PASTA
        link_pasta:     dados.link_pasta, 

        dados_extras:   dados 
      }
    });

    res.json({ sucesso: true, id: lead.id });
  } catch (error) {
    console.error("Erro no Backend:", error);
    res.status(500).json({ erro: "Falha ao salvar", detalhe: error.message });
  }
});

// 2. LISTAR LEADS
app.get('/leads', async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { criadoEm: 'desc' }
    });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar leads" });
  }
});

// 3. ATUALIZAR LEAD (Status ou Link)
app.patch('/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Pega os campos possíveis de atualização
    const { status, link_pasta } = req.body;
    
    // Monta objeto dinâmico (só atualiza o que foi enviado)
    const dataToUpdate = {};
    if (status !== undefined) dataToUpdate.status = status;
    if (link_pasta !== undefined) dataToUpdate.link_pasta = link_pasta;

    const lead = await prisma.lead.update({
      where: { id: Number(id) },
      data: dataToUpdate
    });
    res.json(lead);
  } catch (error) {
    console.error(error);
    res.status(400).json({ erro: "Erro ao atualizar" });
  }
});

// 4. DELETAR
app.delete('/leads/:id', async (req, res) => {
  try {
      await prisma.lead.delete({ where: { id: Number(req.params.id) } });
      res.json({ msg: "Deletado" });
  } catch (e) { res.status(500).json({ erro: "Erro ao deletar" }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
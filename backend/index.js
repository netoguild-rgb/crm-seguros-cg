const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors()); 

app.get('/', (req, res) => res.send('CRM API - Online 🚀'));

// --- ROTAS DE CONFIGURAÇÃO (ATUALIZADA) ---
app.get('/config', async (req, res) => {
  try {
    let config = await prisma.config.findUnique({ where: { id: 'system' } });
    if (!config) {
      config = await prisma.config.create({
        data: { 
            id: 'system', 
            promo_folder_link: '', 
            message_header: '',
            broker_name: 'CRM Seguros',
            primary_color: '#0f172a',
            logo_url: ''
        }
      });
    }
    res.json(config);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar config" });
  }
});

app.post('/config', async (req, res) => {
  try {
    // Recebe todos os campos novos
    const { promo_folder_link, message_header, broker_name, primary_color, logo_url } = req.body;
    
    const config = await prisma.config.upsert({
      where: { id: 'system' },
      update: { promo_folder_link, message_header, broker_name, primary_color, logo_url },
      create: { id: 'system', promo_folder_link, message_header, broker_name, primary_color, logo_url }
    });
    res.json(config);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao salvar config" });
  }
});

// --- ROTAS DE LEADS (MANTIDAS) ---
app.post('/leads', async (req, res) => {
  try {
    const dados = req.body;
    let whatsLimpo = "00000000000";
    if (dados.whatsapp || dados.telefone) {
        whatsLimpo = (dados.whatsapp || dados.telefone).toString().replace(/\D/g, '');
    }

    const lead = await prisma.lead.create({
      data: {
        nome:           dados.nome || dados.Nome_completo || "Sem Nome",
        whatsapp:       whatsLimpo,
        email:          dados.email,
        cpf:            dados.cpf,
        status:         "NOVO",
        tipo_seguro:    dados.tipo_seguro,
        placa:          dados.placa,
        modelo_veiculo: dados.modelo_veiculo,
        ano_veiculo:    dados.ano_do_veiculo || dados.ano_veiculo,
        link_pasta:     dados.link_pasta, 
        dados_extras:   dados 
      }
    });
    res.json({ sucesso: true, id: lead.id });
  } catch (error) {
    res.status(500).json({ erro: "Falha ao salvar", detalhe: error.message });
  }
});

app.get('/leads', async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({ orderBy: { criadoEm: 'desc' } });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar leads" });
  }
});

app.patch('/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, link_pasta } = req.body;
    const dataToUpdate = {};
    if (status !== undefined) dataToUpdate.status = status;
    if (link_pasta !== undefined) dataToUpdate.link_pasta = link_pasta;

    const lead = await prisma.lead.update({
      where: { id: Number(id) },
      data: dataToUpdate
    });
    res.json(lead);
  } catch (error) {
    res.status(400).json({ erro: "Erro ao atualizar" });
  }
});

app.delete('/leads/:id', async (req, res) => {
  try {
      await prisma.lead.delete({ where: { id: Number(req.params.id) } });
      res.json({ msg: "Deletado" });
  } catch (e) { res.status(500).json({ erro: "Erro ao deletar" }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
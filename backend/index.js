// ARQUIVO: backend/index.js

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// CONFIGURAÇÃO CORS ATUALIZADA
// Permite que qualquer origem (seu frontend React) acesse a API
app.use(cors()); 

// Rota de Teste
app.get('/', (req, res) => res.send('CRM Seguros API - Rodando 🚀'));

// ... (MANTENHA TODO O RESTANTE DO CÓDIGO IGUAL ABAIXO) ...
// As rotas POST /leads, GET /leads, PATCH e DELETE continuam iguais - Rodando 🚀'));
// 1. RECEBER LEAD (Salva TUDO)
app.post('/leads', async (req, res) => {
  try {
    const dados = req.body;
    console.log("Recebendo:", dados.nome || "Lead sem nome");

    // Tentativa de limpar o whatsapp (deixar só numeros)
    let whatsLimpo = "00000000000";
    if (dados.whatsapp || dados.telefone) {
        whatsLimpo = (dados.whatsapp || dados.telefone).toString().replace(/\D/g, '');
    }

    const lead = await prisma.lead.create({
      data: {
        // Mapeamento básico (para facilitar filtros depois)
        nome:           dados.nome || dados.Nome_completo || dados.name || "Sem Nome",
        whatsapp:       whatsLimpo,
        email:          dados.email || dados.mail,
        cpf:            dados.cpf,
        status:         "NOVO",
        
        // Específicos mapeados
        tipo_seguro:    dados.tipo_seguro,
        placa:          dados.placa,
        modelo_veiculo: dados.modelo_veiculo,
        ano_veiculo:    dados.ano_do_veiculo || dados.ano_veiculo,
        
        // A MÁGICA: Salva o objeto inteiro do Typebot aqui
        // Assim você nunca perde uma variável nova
        dados_extras:   dados 
      }
    });

    res.json({ sucesso: true, id: lead.id });

  } catch (error) {
    console.error("Erro no Backend:", error);
    res.status(500).json({ erro: "Falha ao salvar", detalhe: error.message });
  }
});

// 2. LISTAR LEADS (Envia tudo pro Frontend)
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

// 3. ATUALIZAR STATUS
app.patch('/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const lead = await prisma.lead.update({
      where: { id: Number(id) },
      data: { status }
    });
    res.json(lead);
  } catch (error) {
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
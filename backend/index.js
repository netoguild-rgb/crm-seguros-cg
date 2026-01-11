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
        nome: dados.nome || dados.Nome_completo || "Sem Nome",
        whatsapp: whatsLimpo,
        email: dados.email,
        cpf: dados.cpf,
        status: "NOVO",
        tipo_seguro: dados.tipo_seguro,
        placa: dados.placa,
        modelo_veiculo: dados.modelo_veiculo,
        ano_veiculo: dados.ano_do_veiculo || dados.ano_veiculo,
        link_pasta: dados.link_pasta,
        dados_extras: dados
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

// ============================================
// INBOX - Conversas e Mensagens
// ============================================

// GET todas as conversas
app.get('/conversations', async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      orderBy: { lastMessageAt: 'desc' },
      include: { messages: { take: 1, orderBy: { timestamp: 'desc' } } }
    });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar conversas" });
  }
});

// GET conversa específica com mensagens
app.get('/conversations/:id', async (req, res) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: Number(req.params.id) },
      include: { messages: { orderBy: { timestamp: 'asc' } } }
    });
    if (!conversation) return res.status(404).json({ erro: "Conversa não encontrada" });
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar conversa" });
  }
});

// POST nova conversa
app.post('/conversations', async (req, res) => {
  try {
    const { remoteJid, name, phone, avatarUrl } = req.body;
    const conversation = await prisma.conversation.upsert({
      where: { remoteJid },
      update: { name, avatarUrl },
      create: { remoteJid, name, phone, avatarUrl }
    });
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao criar conversa" });
  }
});

// POST nova mensagem
app.post('/messages', async (req, res) => {
  try {
    const { conversationId, text, isFromMe, messageId } = req.body;
    const message = await prisma.message.create({
      data: { conversationId, text, isFromMe, messageId, status: 'sent' }
    });
    // Atualiza última mensagem na conversa
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: text,
        lastMessageAt: new Date(),
        unreadCount: isFromMe ? 0 : { increment: 1 }
      }
    });
    res.json(message);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao enviar mensagem" });
  }
});

// PATCH marcar como lida
app.patch('/conversations/:id/read', async (req, res) => {
  try {
    await prisma.conversation.update({
      where: { id: Number(req.params.id) },
      data: { unreadCount: 0 }
    });
    await prisma.message.updateMany({
      where: { conversationId: Number(req.params.id), isFromMe: false },
      data: { status: 'read' }
    });
    res.json({ sucesso: true });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao marcar como lida" });
  }
});

// WEBHOOK Evolution API
app.post('/webhook/evolution', async (req, res) => {
  try {
    const { event, data } = req.body;

    if (event === 'messages.upsert' && data?.message) {
      const msg = data.message;
      const remoteJid = msg.key?.remoteJid;
      const phone = remoteJid?.replace('@s.whatsapp.net', '');
      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
      const isFromMe = msg.key?.fromMe || false;

      // Cria ou atualiza conversa
      const conversation = await prisma.conversation.upsert({
        where: { remoteJid },
        update: {
          lastMessage: text,
          lastMessageAt: new Date(),
          unreadCount: isFromMe ? 0 : { increment: 1 }
        },
        create: { remoteJid, phone, lastMessage: text, lastMessageAt: new Date() }
      });

      // Salva mensagem
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          messageId: msg.key?.id,
          text,
          isFromMe,
          timestamp: new Date(msg.messageTimestamp * 1000)
        }
      });
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ erro: "Erro no webhook" });
  }
});

// ============================================
// MARKETING - Campanhas e Templates
// ============================================

// GET campanhas
app.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar campanhas" });
  }
});

// POST nova campanha
app.post('/campaigns', async (req, res) => {
  try {
    const { name, type, status, startDate, endDate, description, imageUrl } = req.body;
    const campaign = await prisma.campaign.create({
      data: {
        name,
        type,
        status: status || 'active',
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        description,
        imageUrl
      }
    });
    // Registra atividade
    await prisma.activity.create({
      data: { action: `Campanha "${name}" criada`, icon: 'megaphone', color: 'text-purple-600', relatedId: campaign.id, relatedType: 'campaign' }
    });
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao criar campanha", detalhe: error.message });
  }
});

// PATCH atualizar campanha
app.patch('/campaigns/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, views, engagement, leads } = req.body;
    const dataToUpdate = {};
    if (status !== undefined) dataToUpdate.status = status;
    if (views !== undefined) dataToUpdate.views = views;
    if (engagement !== undefined) dataToUpdate.engagement = engagement;
    if (leads !== undefined) dataToUpdate.leads = leads;

    const campaign = await prisma.campaign.update({
      where: { id: Number(id) },
      data: dataToUpdate
    });
    res.json(campaign);
  } catch (error) {
    res.status(400).json({ erro: "Erro ao atualizar campanha" });
  }
});

// DELETE campanha
app.delete('/campaigns/:id', async (req, res) => {
  try {
    await prisma.campaign.delete({ where: { id: Number(req.params.id) } });
    res.json({ msg: "Campanha deletada" });
  } catch (e) { res.status(500).json({ erro: "Erro ao deletar" }); }
});

// GET templates
app.get('/templates', async (req, res) => {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar templates" });
  }
});

// POST novo template
app.post('/templates', async (req, res) => {
  try {
    const { name, category, icon, gradient, content, imageUrl } = req.body;
    const template = await prisma.template.create({
      data: { name, category, icon, gradient, content, imageUrl }
    });
    res.json(template);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao criar template" });
  }
});

// ============================================
// SERVIÇOS - Posts
// ============================================

// GET posts
app.get('/posts', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar posts" });
  }
});

// POST novo post
app.post('/posts', async (req, res) => {
  try {
    const { title, content, platform, status, scheduledAt, imageUrl } = req.body;
    const post = await prisma.post.create({
      data: {
        title,
        content,
        platform,
        status: status || 'draft',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        imageUrl
      }
    });
    // Registra atividade
    const action = status === 'published' ? `Post "${title}" publicado` :
      status === 'scheduled' ? `Post agendado para ${scheduledAt}` :
        `Rascunho "${title}" criado`;
    await prisma.activity.create({
      data: { action, icon: 'send', color: 'text-green-600', relatedId: post.id, relatedType: 'post' }
    });
    res.json(post);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao criar post" });
  }
});

// PATCH atualizar post
app.patch('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, views, likes, shares, publishedAt } = req.body;
    const dataToUpdate = {};
    if (status !== undefined) dataToUpdate.status = status;
    if (views !== undefined) dataToUpdate.views = views;
    if (likes !== undefined) dataToUpdate.likes = likes;
    if (shares !== undefined) dataToUpdate.shares = shares;
    if (publishedAt !== undefined) dataToUpdate.publishedAt = new Date(publishedAt);

    const post = await prisma.post.update({
      where: { id: Number(id) },
      data: dataToUpdate
    });
    res.json(post);
  } catch (error) {
    res.status(400).json({ erro: "Erro ao atualizar post" });
  }
});

// DELETE post
app.delete('/posts/:id', async (req, res) => {
  try {
    await prisma.post.delete({ where: { id: Number(req.params.id) } });
    res.json({ msg: "Post deletado" });
  } catch (e) { res.status(500).json({ erro: "Erro ao deletar" }); }
});

// ============================================
// SERVIÇOS - Tráfego Pago
// ============================================

// GET dados de tráfego
app.get('/traffic', async (req, res) => {
  try {
    const { period } = req.query;
    const where = period ? { period } : {};
    const traffic = await prisma.trafficData.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json(traffic);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar dados de tráfego" });
  }
});

// POST/UPDATE dados de tráfego
app.post('/traffic', async (req, res) => {
  try {
    const { platform, period, spend, clicks, impressions, ctr, conversions } = req.body;
    const traffic = await prisma.trafficData.upsert({
      where: { platform_period: { platform, period } },
      update: { spend, clicks, impressions, ctr, conversions },
      create: { platform, period, spend, clicks, impressions, ctr, conversions }
    });
    res.json(traffic);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao salvar dados de tráfego" });
  }
});

// ============================================
// ATIVIDADES RECENTES
// ============================================

// GET atividades recentes
app.get('/activities', async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar atividades" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
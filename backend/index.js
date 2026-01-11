require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Stripe initialization (only if key exists)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('SUBSTITUA')) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_production';

// Middleware para parsear JSON (exceto webhook do Stripe)
app.use((req, res, next) => {
  if (req.originalUrl === '/stripe/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(cors());

// ============================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ============================================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Token de acesso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ erro: 'Token inválido ou expirado' });
    }
    req.user = user;
    next();
  });
};

// Middleware opcional (não bloqueia, mas adiciona user se existir)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
};

app.get('/', (req, res) => res.send('CRM API - Online 🚀'));

// ============================================
// AUTENTICAÇÃO - Registro, Login, Me
// ============================================

// POST /auth/register - Criar novo usuário
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ erro: 'Email, senha e nome são obrigatórios' });
    }

    // Verifica se usuário já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ erro: 'Email já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'user'
      }
    });

    // Cria assinatura gratuita
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: 'free',
        status: 'active'
      }
    });

    // Cria cliente no Stripe se configurado
    if (stripe) {
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: { userId: user.id.toString() }
        });

        await prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId: customer.id }
        });
      } catch (stripeError) {
        console.error('Erro ao criar cliente Stripe:', stripeError.message);
      }
    }

    res.status(201).json({
      sucesso: true,
      mensagem: 'Usuário criado com sucesso'
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ erro: 'Erro ao criar usuário', detalhe: error.message });
  }
});

// POST /auth/login - Login do usuário
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    // Busca usuário
    const user = await prisma.user.findUnique({
      where: { email },
      include: { subscription: true }
    });

    if (!user) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }

    // Verifica senha
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }

    // Gera token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscription: user.subscription
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ erro: 'Erro ao fazer login' });
  }
});

// GET /auth/me - Dados do usuário logado
app.get('/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { subscription: true }
    });

    if (!user) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      subscription: user.subscription,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar usuário' });
  }
});

// ============================================
// STRIPE - Pagamentos e Assinaturas
// ============================================

// Planos disponíveis
const PLANS = {
  basic: {
    name: 'Basic',
    price: 4900, // R$ 49,00 em centavos
    features: ['100 leads', '1 usuário', 'Inbox básico']
  },
  pro: {
    name: 'Pro',
    price: 9900, // R$ 99,00
    features: ['500 leads', '3 usuários', 'Marketing', 'Integrações']
  },
  enterprise: {
    name: 'Enterprise',
    price: 19900, // R$ 199,00
    features: ['Leads ilimitados', 'Usuários ilimitados', 'API', 'Suporte prioritário']
  }
};

// GET /stripe/plans - Lista planos disponíveis
app.get('/stripe/plans', (req, res) => {
  res.json(PLANS);
});

// POST /stripe/create-checkout-session - Criar sessão de checkout
app.post('/stripe/create-checkout-session', authenticateToken, async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ erro: 'Stripe não configurado' });
  }

  try {
    const { plan } = req.body;

    if (!plan || !PLANS[plan]) {
      return res.status(400).json({ erro: 'Plano inválido' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    // Obtém o priceId do ambiente ou usa o modo de teste
    const priceId = process.env[`STRIPE_PRICE_${plan.toUpperCase()}`];

    if (!priceId || priceId.includes('SUBSTITUA')) {
      // Modo demo: retorna URL fake para teste
      return res.json({
        url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/billing?demo=true&plan=${plan}`,
        demo: true
      });
    }

    // Cria sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: user.stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?canceled=true`,
      metadata: {
        userId: user.id.toString(),
        plan
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    res.status(500).json({ erro: 'Erro ao criar sessão de checkout' });
  }
});

// GET /stripe/subscription - Status da assinatura
app.get('/stripe/subscription', authenticateToken, async (req, res) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    if (!subscription) {
      return res.json({ plan: 'free', status: 'active' });
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar assinatura' });
  }
});

// POST /stripe/cancel - Cancelar assinatura
app.post('/stripe/cancel', authenticateToken, async (req, res) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      return res.status(400).json({ erro: 'Nenhuma assinatura ativa' });
    }

    if (stripe && subscription.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    }

    await prisma.subscription.update({
      where: { userId: req.user.id },
      data: { status: 'canceled', plan: 'free' }
    });

    res.json({ sucesso: true, mensagem: 'Assinatura cancelada' });
  } catch (error) {
    console.error('Erro ao cancelar:', error);
    res.status(500).json({ erro: 'Erro ao cancelar assinatura' });
  }
});

// POST /stripe/demo-upgrade - Simular upgrade para testes
app.post('/stripe/demo-upgrade', authenticateToken, async (req, res) => {
  try {
    const { plan } = req.body;

    if (!plan || !PLANS[plan]) {
      return res.status(400).json({ erro: 'Plano inválido' });
    }

    const now = new Date();
    const endDate = new Date(now.setMonth(now.getMonth() + 1));

    await prisma.subscription.upsert({
      where: { userId: req.user.id },
      update: {
        plan,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: endDate
      },
      create: {
        userId: req.user.id,
        plan,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: endDate
      }
    });

    res.json({ sucesso: true, mensagem: `Upgrade para ${plan} realizado (modo demo)` });
  } catch (error) {
    res.status(500).json({ erro: 'Erro no upgrade demo' });
  }
});

// POST /stripe/webhook - Webhook do Stripe
app.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ erro: 'Stripe não configurado' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle eventos
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = parseInt(session.metadata.userId);
      const plan = session.metadata.plan;

      await prisma.subscription.upsert({
        where: { userId },
        update: {
          stripeSubscriptionId: session.subscription,
          plan,
          status: 'active',
          currentPeriodStart: new Date()
        },
        create: {
          userId,
          stripeSubscriptionId: session.subscription,
          plan,
          status: 'active',
          currentPeriodStart: new Date()
        }
      });
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const customer = await stripe.customers.retrieve(subscription.customer);
      const userId = parseInt(customer.metadata.userId);

      await prisma.subscription.update({
        where: { userId },
        data: {
          status: subscription.status === 'active' ? 'active' :
            subscription.status === 'past_due' ? 'past_due' : 'canceled',
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000)
        }
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const customer = await stripe.customers.retrieve(subscription.customer);
      const userId = parseInt(customer.metadata.userId);

      await prisma.subscription.update({
        where: { userId },
        data: { status: 'canceled', plan: 'free' }
      });
      break;
    }
  }

  res.json({ received: true });
});

// ============================================
// ROTAS PROTEGIDAS - Config, Leads, etc.
// ============================================

// --- ROTAS DE CONFIGURAÇÃO ---
app.get('/config', optionalAuth, async (req, res) => {
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

app.post('/config', authenticateToken, async (req, res) => {
  try {
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

// --- ROTAS DE LEADS ---
app.post('/leads', optionalAuth, async (req, res) => {
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

app.get('/leads', optionalAuth, async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({ orderBy: { criadoEm: 'desc' } });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar leads" });
  }
});

app.patch('/leads/:id', authenticateToken, async (req, res) => {
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

app.delete('/leads/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.lead.delete({ where: { id: Number(req.params.id) } });
    res.json({ msg: "Deletado" });
  } catch (e) { res.status(500).json({ erro: "Erro ao deletar" }); }
});

// ============================================
// INBOX - Conversas e Mensagens
// ============================================

app.get('/conversations', optionalAuth, async (req, res) => {
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

app.get('/conversations/:id', optionalAuth, async (req, res) => {
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

app.post('/conversations', authenticateToken, async (req, res) => {
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

app.post('/messages', authenticateToken, async (req, res) => {
  try {
    const { conversationId, text, isFromMe, messageId } = req.body;
    const message = await prisma.message.create({
      data: { conversationId, text, isFromMe, messageId, status: 'sent' }
    });
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

app.patch('/conversations/:id/read', authenticateToken, async (req, res) => {
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

// WEBHOOK Evolution API (sem auth para receber do Evolution)
app.post('/webhook/evolution', async (req, res) => {
  try {
    const { event, data } = req.body;

    if (event === 'messages.upsert' && data?.message) {
      const msg = data.message;
      const remoteJid = msg.key?.remoteJid;
      const phone = remoteJid?.replace('@s.whatsapp.net', '');
      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
      const isFromMe = msg.key?.fromMe || false;

      const conversation = await prisma.conversation.upsert({
        where: { remoteJid },
        update: {
          lastMessage: text,
          lastMessageAt: new Date(),
          unreadCount: isFromMe ? 0 : { increment: 1 }
        },
        create: { remoteJid, phone, lastMessage: text, lastMessageAt: new Date() }
      });

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

app.get('/campaigns', optionalAuth, async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar campanhas" });
  }
});

app.post('/campaigns', authenticateToken, async (req, res) => {
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
    await prisma.activity.create({
      data: { action: `Campanha "${name}" criada`, icon: 'megaphone', color: 'text-purple-600', relatedId: campaign.id, relatedType: 'campaign' }
    });
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao criar campanha", detalhe: error.message });
  }
});

app.patch('/campaigns/:id', authenticateToken, async (req, res) => {
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

app.delete('/campaigns/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.campaign.delete({ where: { id: Number(req.params.id) } });
    res.json({ msg: "Campanha deletada" });
  } catch (e) { res.status(500).json({ erro: "Erro ao deletar" }); }
});

app.get('/templates', optionalAuth, async (req, res) => {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar templates" });
  }
});

app.post('/templates', authenticateToken, async (req, res) => {
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

app.get('/posts', optionalAuth, async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar posts" });
  }
});

app.post('/posts', authenticateToken, async (req, res) => {
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

app.patch('/posts/:id', authenticateToken, async (req, res) => {
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

app.delete('/posts/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.post.delete({ where: { id: Number(req.params.id) } });
    res.json({ msg: "Post deletado" });
  } catch (e) { res.status(500).json({ erro: "Erro ao deletar" }); }
});

// ============================================
// SERVIÇOS - Tráfego Pago
// ============================================

app.get('/traffic', optionalAuth, async (req, res) => {
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

app.post('/traffic', authenticateToken, async (req, res) => {
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

app.get('/activities', optionalAuth, async (req, res) => {
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
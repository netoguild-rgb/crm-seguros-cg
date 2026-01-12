// ============================================
// MIDDLEWARE DE MULTI-TENANCY E LIMITES
// ============================================

// Limites por plano
const PLAN_LIMITS = {
    free: {
        leads: 20,
        conversations: 10,
        campaigns: 2,
        templates: 5,
        policies: 0,
        posts: 5,
        whatsapp: false
    },
    basic: {
        leads: 50,
        conversations: 100,
        campaigns: 10,
        templates: 20,
        policies: 0,
        posts: 20,
        whatsapp: true
    },
    pro: {
        leads: 500,
        conversations: 1000,
        campaigns: 50,
        templates: 100,
        policies: 0,
        posts: 100,
        whatsapp: true
    },
    enterprise: {
        leads: -1, // Ilimitado
        conversations: -1,
        campaigns: -1,
        templates: -1,
        policies: -1,
        posts: -1,
        whatsapp: true
    }
};

// Middleware para injetar filtro de tenant
const tenantFilter = (req, res, next) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ erro: 'Usuário não autenticado' });
    }
    req.tenantFilter = { userId: req.user.id };
    next();
};

// Middleware para verificar limites de recursos
const checkLimit = (prisma, resource) => async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Buscar plano do usuário
        const subscription = await prisma.subscription.findUnique({
            where: { userId }
        });

        const plan = subscription?.plan || 'free';
        const limit = PLAN_LIMITS[plan][resource];

        // -1 significa ilimitado
        if (limit === -1) {
            return next();
        }

        // Recurso não disponível no plano
        if (limit === 0) {
            return res.status(403).json({
                erro: `Recurso não disponível no plano ${plan}. Faça upgrade para acessar.`,
                upgradeRequired: true
            });
        }

        // Contar recursos atuais
        const modelName = resource.charAt(0).toUpperCase() + resource.slice(1);
        const count = await prisma[resource].count({
            where: { userId }
        });

        if (count >= limit) {
            return res.status(403).json({
                erro: `Limite de ${resource} atingido (${count}/${limit}). Faça upgrade do seu plano.`,
                limit,
                current: count,
                upgradeRequired: true
            });
        }

        // Passar informação do limite para a requisição
        req.resourceLimit = { limit, current: count };
        next();
    } catch (error) {
        console.error('Erro ao verificar limite:', error);
        next(); // Em caso de erro, permite continuar
    }
};

// Middleware para verificar se feature está disponível no plano
const checkFeature = (prisma, feature) => async (req, res, next) => {
    try {
        const userId = req.user.id;

        const subscription = await prisma.subscription.findUnique({
            where: { userId }
        });

        const plan = subscription?.plan || 'free';
        const hasFeature = PLAN_LIMITS[plan][feature];

        if (!hasFeature) {
            return res.status(403).json({
                erro: `Recurso "${feature}" não disponível no plano ${plan}.`,
                upgradeRequired: true
            });
        }

        next();
    } catch (error) {
        console.error('Erro ao verificar feature:', error);
        next();
    }
};

// Middleware para verificar role (admin/superadmin)
const requireRole = (...roles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ erro: 'Não autenticado' });
    }

    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ erro: 'Acesso negado. Permissão insuficiente.' });
    }

    next();
};

// Helper para obter limites do usuário
const getUserLimits = async (prisma, userId) => {
    const subscription = await prisma.subscription.findUnique({
        where: { userId }
    });

    const plan = subscription?.plan || 'free';
    const limits = PLAN_LIMITS[plan];

    // Contar uso atual
    const [leads, conversations, campaigns, templates, posts, policies] = await Promise.all([
        prisma.lead.count({ where: { userId } }),
        prisma.conversation.count({ where: { userId } }),
        prisma.campaign.count({ where: { userId } }),
        prisma.template.count({ where: { userId } }),
        prisma.post.count({ where: { userId } }),
        prisma.policy.count({ where: { userId } })
    ]);

    return {
        plan,
        limits,
        usage: { leads, conversations, campaigns, templates, posts, policies }
    };
};

module.exports = {
    PLAN_LIMITS,
    tenantFilter,
    checkLimit,
    checkFeature,
    requireRole,
    getUserLimits
};

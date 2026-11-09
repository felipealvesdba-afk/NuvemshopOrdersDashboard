const express = require('express');
const router = express.Router();
const firestoreService = require('../services/firestore');

/**
 * POST /api/etiquetas
 * Chamado pelo robô de etiquetas (Mac mini) depois de cada impressão.
 * Body: { pedidos: ["47232"], impresso_em: "2026-11-09T14:48:55", valor_total: 17.26, etiquetas: ["Label_..."] }
 * Header: Authorization: Bearer <ETIQUETAS_TOKEN>
 */
router.post('/', async (req, res) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!process.env.ETIQUETAS_TOKEN || token !== process.env.ETIQUETAS_TOKEN) {
    return res.status(401).json({ success: false, error: 'unauthorized' });
  }
  const { pedidos, impresso_em, valor_total, etiquetas } = req.body || {};
  if (!Array.isArray(pedidos) || pedidos.length === 0 || pedidos.length > 200) {
    return res.status(400).json({ success: false, error: 'pedidos inválido' });
  }
  const numeros = pedidos.map(String).filter(n => /^\d{1,10}$/.test(n));
  const result = await firestoreService.saveLabelPrints(numeros, { impresso_em, valor_total, etiquetas });
  res.status(result.success ? 200 : 500).json(result);
});

/**
 * GET /api/etiquetas?dias=7
 * Lista as etiquetas impressas nos últimos N dias (mais recentes primeiro).
 */
router.get('/', async (req, res) => {
  const dias = Math.min(Math.max(parseInt(req.query.dias) || 7, 1), 60);
  const result = await firestoreService.getLabelPrints(dias);
  res.json(result);
});

module.exports = router;

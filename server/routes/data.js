const express = require('express');
const { getHistory, getLatestAll } = require('../db');

const router = express.Router();

const VALID_SENSORS = ['temp', 'umid', 'luz'];

router.get('/history/:sensor', async (req, res) => {
  const { sensor } = req.params;

  if (!VALID_SENSORS.includes(sensor)) {
    return res.status(400).json({ error: 'Sensor inválido. Use: temp, umid, luz' });
  }

  try {
    const limit = Math.min(parseInt(req.query.limit) || 200, 1000);
    const from = req.query.from ? parseInt(req.query.from) : null;
    const to = req.query.to ? parseInt(req.query.to) : null;

    const data = await getHistory(sensor, limit, from, to);
    res.json({ sensor, count: data.length, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/latest', async (req, res) => {
  try {
    res.json(await getLatestAll());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

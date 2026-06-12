require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { startMqttListener } = require('./mqtt-listener');
const dataRoutes = require('./routes/data');
const { saveDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api', dataRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Rodando em http://0.0.0.0:${PORT}`);

  const mqttConfig = {
    host: process.env.MQTT_HOST,
    port: parseInt(process.env.MQTT_PORT) || 8883,
    user: process.env.MQTT_USER,
    pass: process.env.MQTT_PASS,
  };

  if (!mqttConfig.host || !mqttConfig.user || !mqttConfig.pass) {
    console.log('[MQTT] Configuração ausente. Defina MQTT_HOST, MQTT_USER e MQTT_PASS. Apenas API rodando.');
  } else {
    const client = startMqttListener(mqttConfig);
    console.log('[MQTT] Listener iniciado');

    const shutdown = () => {
      console.log('[Server] Encerrando...');
      client.end(true);
      saveDb();
      server.close(() => process.exit(0));
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }
});

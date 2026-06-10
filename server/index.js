require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { startMqttListener } = require('./mqtt-listener');
const dataRoutes = require('./routes/data');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api', dataRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Rodando em http://0.0.0.0:${PORT}`);

  const mqttConfig = {
    host: process.env.MQTT_HOST,
    port: parseInt(process.env.MQTT_PORT) || 8883,
    user: process.env.MQTT_USER,
    pass: process.env.MQTT_PASS,
  };

  if (mqttConfig.host) {
    startMqttListener(mqttConfig);
    console.log('[MQTT] Listener iniciado');
  } else {
    console.log('[MQTT] Configuração ausente. Apenas API rodando.');
  }
});

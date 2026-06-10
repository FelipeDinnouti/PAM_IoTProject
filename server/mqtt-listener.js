const mqtt = require('mqtt');
const { insertReading } = require('./db');

const SENSOR_MAP = {
  'casa/temp': 'temp',
  'casa/umid': 'umid',
  'casa/luz': 'luz',
};

function startMqttListener(config) {
  const url = `mqtts://${config.host}:${config.port}`;

  const client = mqtt.connect(url, {
    username: config.user,
    password: config.pass,
    clientId: config.clientId || 'PAM_Backend_' + Math.random().toString(16).slice(2, 10),
    rejectUnauthorized: false,
  });

  client.on('connect', () => {
    console.log('[MQTT] Conectado ao HiveMQ');
    client.subscribe('casa/temp');
    client.subscribe('casa/umid');
    client.subscribe('casa/luz');
    console.log('[MQTT] Inscrito em casa/temp, casa/umid, casa/luz');
  });

  client.on('message', (topic, payload) => {
    const value = parseFloat(payload.toString());
    const timestamp = Date.now();
    const sensor = SENSOR_MAP[topic];

    if (sensor && !isNaN(value)) {
      insertReading(sensor, value, timestamp);
    }
  });

  client.on('error', (err) => {
    console.error('[MQTT] Erro:', err.message);
  });

  return client;
}

module.exports = { startMqttListener };

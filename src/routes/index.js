const express = require('express');
const router = express.Router();
const { SENSEBOX_IDS, getTemperature } = require('../services/openSenseMap');
const APP_VERSION = require('../../package.json').version;

const ONE_HOUR_MS = 60 * 60 * 1000;

router.get('/version', (req, res) => {
  res.send(APP_VERSION);
});

router.get('/temperature', async (req, res) => {
  const readings = await Promise.all(SENSEBOX_IDS.map(id => getTemperature(id)));

  const now = Date.now();
  const staleReading = readings.find(r => {
    const readingTime = new Date(r.createdAt).getTime();
    return (now - readingTime) >= ONE_HOUR_MS;
  });

  if (staleReading) {
    return res.status(503).send({ error: 'Sensor data is outdated' });
  }

  const averageTemperature = readings.reduce((sum, r) => sum + r.value, 0) / readings.length;
  res.send({ averageTemperature });
});

module.exports = router;
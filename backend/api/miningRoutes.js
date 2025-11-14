const express = require('express');
const router = express.Router();
const deviceMap = {}; // deviceId -> lastHeartbeat

router.post('/heartbeat', (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId) return res.status(400).json({ error: 'no deviceId' });
  deviceMap[deviceId] = Date.now();
  // reward algorithm placeholder: 1 coin per heartbeat
  return res.json({ rewardCoins: 1, total: (deviceMap[deviceId] || 0) });
});

module.exports = router;

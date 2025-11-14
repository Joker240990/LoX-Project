// Very small miner simulator: registers device and polls server for reward
const axios = require('axios');
const { machineIdSync } = require('node-machine-id');

const deviceId = machineIdSync();
const API = process.env.BACKEND_URL || 'http://localhost:4000';

async function mineLoop(){
  console.log('mining loop start for device', deviceId);
  while(true){
    try{
      const res = await axios.post(`${API}/mining/heartbeat`, { deviceId });
      console.log('mining response', res.data);
    }catch(e){ console.error('err', e.message); }
    await new Promise(r=>setTimeout(r, 60000)); // every minute
  }
}

mineLoop();

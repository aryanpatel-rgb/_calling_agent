import express from 'express';
import twilio from 'twilio';
import { config } from '../config.js';
import { log } from '../utils/logger.js';

const router = express.Router();
const client = twilio(config.twilio.sid, config.twilio.auth);

router.post('/api/initiate-call', async (req, res) => {
  try {
    const { name, email, phone, selected_service } = req.body || {};
    if (!phone) return res.status(400).json({ error: 'phone is required' });

    const twimlUrl = `${config.publicBaseUrl}/voice/twiml?name=${encodeURIComponent(name||'')}&email=${encodeURIComponent(email||'')}&service=${encodeURIComponent(selected_service||'')}`;

    const call = await client.calls.create({
      to: phone,
      from: config.twilio.from,
      url: twimlUrl
    });

    log('Call initiated', call.sid);
    res.json({ ok: true, sid: call.sid });
  } catch (e) {
    log('initiate-call error', e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;

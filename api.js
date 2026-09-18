const express = require('express');
const router = express.Router();
const state = require('../whatsapp/state');
const sse = require('../services/sse');

router.get('/status', (req, res) => {
    res.json({ status: state.status, qr: state.qr });
});

router.post('/send', async (req, res) => {
    if (state.status !== 'connected' || !state.sock) {
        return res.status(400).json({ error: 'WhatsApp not connected' });
    }
    
    const { number, text } = req.body;
    try {
        const jid = `${number.replace(/\D/g, '')}@s.whatsapp.net`;
        await state.sock.sendMessage(jid, { text });
        res.json({ success: true, message: 'Message sent' });
    } catch (error) {
        console.error('Failed to send message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

router.get('/stream', (req, res) => {
    sse.addClient(req, res, state.getState());
});

module.exports = router;

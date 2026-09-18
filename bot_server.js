const express = require('express');
const apiRoutes = require('./src/routes/api');
const { connectToWhatsApp } = require('./src/whatsapp/client');

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    connectToWhatsApp();
});

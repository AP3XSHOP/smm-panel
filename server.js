const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(express.json());

// SMM Panel Bilgilerin
const SMM_CONFIG = {
    apiUrl: process.env.SMM_API_URL || 'https://ANASAGLAYICISITE.com/api/v2',
    apiKey: process.env.SMM_API_KEY || 'SENIN_API_KEYIN',
    serviceId: process.env.SMM_SERVICE_ID || '1234'
};

// HTML Arayüzü
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AP3X - SMM Otomasyon</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
            .card { background: #1e293b; padding: 24px; border-radius: 16px; width: 100%; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); border: 1px solid #334155; }
            h2 { text-align: center; color: #38bdf8; margin-top: 0; margin-bottom: 20px; font-size: 22px; }
            label { font-size: 14px; color: #94a3b8; display: block; margin-top: 12px; }
            input { width: 100%; padding: 14px; margin-top: 6px; border-radius: 10px; border: 1px solid #475569; background: #0f172a; color: #fff; font-size: 16px; box-sizing: border-box; outline: none; }
            input:focus { border-color: #38bdf8; }
            button { width: 100%; background: #0284c7; color: #fff; font-weight: bold; border: none; padding: 14px; border-radius: 10px; margin-top: 20px; font-size: 16px; cursor: pointer; transition: 0.2s; }
            button:active { transform: scale(0.98); }
            #status { margin-top: 16px; text-align: center; font-size: 14px; font-weight: 600; word-break: break-all; }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>AP3X Sipariş Paneli</h2>
            <label>Instagram Link / Kullanıcı Adı:</label>
            <input type="text" id="link" placeholder="instagram.com/kullanici">
            <label>Miktar:</label>
            <input type="number" id="quantity" value="1000">
            <button onclick="sendOrder()">Gönderimi Başlat</button>
            <div id="status"></div>
        </div>
        <script>
            async function sendOrder() {
                const link = document.getElementById('link').value;
                const quantity = document.getElementById('quantity').value;
                const statusDiv = document.getElementById('status');
                if(!link || !quantity) { statusDiv.style.color = '#f87171'; statusDiv.innerText = 'Lütfen alanları doldurun!'; return; }
                statusDiv.style.color = '#facc15'; statusDiv.innerText = 'İşlem yapılıyor...';
                try {
                    const res = await fetch('/api/send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ link, quantity })
                    });
                    const data = await res.json();
                    if(data.success) {
                        statusDiv.style.color = '#4ade80';
                        statusDiv.innerText = 'Sipariş Başarılı! ID: ' + data.orderId;
                    } else {
                        statusDiv.style.color = '#f87171';
                        statusDiv.innerText = 'Hata: ' + JSON.stringify(data.error);
                    }
                } catch(e) {
                    statusDiv.style.color = '#f87171';
                    statusDiv.innerText = 'Bağlantı hatası!';
                }
            }
        </script>
    </body>
    </html>
    `);
});

// API Istek Noktası
app.post('/api/send', async (req, res) => {
    const { link, quantity } = req.body;
    try {
        const params = new URLSearchParams();
        params.append('key', SMM_CONFIG.apiKey);
        params.append('action', 'add');
        params.append('service', SMM_CONFIG.serviceId);
        params.append('link', link);
        params.append('quantity', quantity);

        const response = await axios.post(SMM_CONFIG.apiUrl, params);
        if (response.data && response.data.order) {
            res.json({ success: true, orderId: response.data.order });
        } else {
            res.json({ success: false, error: response.data });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu aktif: ${PORT}`));
  

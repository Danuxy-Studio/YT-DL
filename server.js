require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Compression untuk Vercel
app.use((req, res, next) => {
  if (req.url.match(/\.(css|js|png|ico|woff2)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  if (req.url === '/' || req.url === '/index.html') {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Proxy download
app.get('/api/download', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false });
    const response = await axios({ method: 'GET', url, responseType: 'stream', timeout: 60000 });
    const filename = url.split('/').pop();
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    response.data.pipe(res);
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// API endpoints
app.post('/api/youtube/ytmp4', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL required' });
    
    const response = await axios.post(`${process.env.API_BASE_URL}/ytmp4`, {
      url, quality: "1080p"
    }, {
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.API_KEY },
      timeout: 30000
    });
    
    if (response.data?.success) {
      const proxyUrl = `/api/download?url=${encodeURIComponent(response.data.data.download.download_url)}`;
      res.json({ success: true, data: { ...response.data.data, download: { ...response.data.data.download, download_url: proxyUrl } } });
    } else {
      throw new Error('Failed');
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/youtube/ytmp3', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL required' });
    
    const response = await axios.post(`${process.env.API_BASE_URL}/ytmp3`, { url }, {
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.API_KEY },
      timeout: 30000
    });
    
    if (response.data?.success) {
      const proxyUrl = `/api/download?url=${encodeURIComponent(response.data.data.download.download_url)}`;
      res.json({ success: true, data: { ...response.data.data, download: { ...response.data.data.download, download_url: proxyUrl } } });
    } else {
      throw new Error('Failed');
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/robots.txt', (req, res) => res.sendFile(path.join(__dirname, 'public', 'robots.txt')));
app.get('/sitemap.xml', (req, res) => res.sendFile(path.join(__dirname, 'public', 'sitemap.xml')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
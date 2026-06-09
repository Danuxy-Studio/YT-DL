require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// ============ COMPRESSION ============
app.use(compression({ level: 9, threshold: 0, filter: (req, res) => {
  if (req.headers['x-no-compression']) return false;
  return compression.filter(req, res);
}}));

// ============ SECURITY & CACHE HEADERS ============
app.use((req, res, next) => {
  // Cache static assets 1 tahun
  if (req.url.match(/\.(css|js|png|ico|woff2)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // HTML cache 1 jam
  if (req.url === '/' || req.url === '/index.html') {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // CSP yang benar untuk Google Fonts & CDN
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
    "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:; " +
    "img-src 'self' data: https: http: https://i.ytimg.com; " +
    "connect-src 'self' https://api.danuxy.com; " +
    "frame-src 'none'; " +
    "object-src 'none'"
  );
  
  next();
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ============ PROXY DOWNLOAD ============
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

// ============ API ENDPOINTS ============
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

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));
app.get('/robots.txt', (req, res) => res.sendFile(path.join(__dirname, 'public', 'robots.txt')));
app.get('/sitemap.xml', (req, res) => res.sendFile(path.join(__dirname, 'public', 'sitemap.xml')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
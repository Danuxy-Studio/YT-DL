require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// ============ SECURITY HEADERS ============
app.use((req, res, next) => {
  // Header khusus untuk Open Graph
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Cache untuk asset gambar
  if (req.url.includes('/assets/')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Content-Type', 'image/png');
  }
  
  next();
});

app.use(cors());
app.use(express.json());

// ============ STATIC FILES ============
app.use(express.static('public', {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      // Header penting untuk Open Graph
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// Asset route dengan header khusus
app.get('/assets/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public', 'assets', filename);
  
  res.sendFile(filePath, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*'
    }
  });
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// API endpoints
app.post('/api/youtube/ytmp4', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    console.log(`[MP4 Request] URL: ${url}`);

    const response = await axios.post(`${process.env.API_BASE_URL}/ytmp4`, {
      url: url,
      quality: "1080p"
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.API_KEY
      },
      timeout: 30000
    });

    if (response.data && response.data.success === true) {
      const data = response.data.data;
      
      if (!data || !data.download || !data.download.download_url) {
        return res.status(500).json({ 
          success: false, 
          message: 'Invalid response from API service' 
        });
      }
      
      console.log(`[MP4 Success] Title: ${data.video_info?.title || 'Unknown'}`);
      
      res.json({
        success: true,
        data: {
          video_info: data.video_info,
          download: data.download
        }
      });
    } else {
      throw new Error(response.data?.message || 'Failed to process video');
    }
  } catch (error) {
    console.error('[MP4 Error]:', error.message);
    res.status(500).json({ 
      success: false, 
      message: error.response?.data?.message || error.message || 'Failed to process video' 
    });
  }
});

app.post('/api/youtube/ytmp3', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    console.log(`[MP3 Request] URL: ${url}`);

    const response = await axios.post(`${process.env.API_BASE_URL}/ytmp3`, {
      url: url
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.API_KEY
      },
      timeout: 30000
    });

    if (response.data && response.data.success === true) {
      const data = response.data.data;
      
      if (!data || !data.download || !data.download.download_url) {
        return res.status(500).json({ 
          success: false, 
          message: 'Invalid response from API service' 
        });
      }
      
      console.log(`[MP3 Success] Title: ${data.video_info?.title || 'Unknown'}`);
      
      res.json({
        success: true,
        data: {
          video_info: data.video_info,
          download: data.download
        }
      });
    } else {
      throw new Error(response.data?.message || 'Failed to process audio');
    }
  } catch (error) {
    console.error('[MP3 Error]:', error.message);
    res.status(500).json({ 
      success: false, 
      message: error.response?.data?.message || error.message || 'Failed to process audio' 
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// SEO Routes
app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

// Catch all
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Danuxy Studio Downloader running on http://localhost:${PORT}`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
});
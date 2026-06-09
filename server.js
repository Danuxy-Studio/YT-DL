require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// ============ OPTIMIZED SECURITY & SEO HEADERS ============
app.use((req, res, next) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  
  // Security headers yang benar untuk Google Fonts
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
    "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:; " +
    "img-src 'self' data: https: http: https://i.ytimg.com; " +
    "connect-src 'self' https://api.danuxy.com; " +
    "frame-src 'none'; " +
    "object-src 'none'"
  );
  
  // HSTS header dengan preload
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  
  // COOP header
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  
  // X-Frame-Options
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Referrer-Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions-Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Cache headers untuk asset statis
  if (req.url.match(/\.(css|js|png|ico|jpg|jpeg|svg|woff2)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  // HTML tidak di-cache terlalu lama
  if (req.url === '/' || req.url === '/index.html') {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
  
  next();
});

app.use(cors());
app.use(express.json());

// ============ COMPRESSION FOR BETTER PERFORMANCE ============
const compression = require('compression');
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Static files dengan cache optimal
app.use(express.static('public', {
  maxAge: '1y',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
    if (filePath.endsWith('.xml') || filePath.endsWith('.txt')) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  }
}));

// Asset route dengan cache
app.get('/assets/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'assets', req.params.filename);
  res.sendFile(filePath, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
});

// Proxy download endpoint
app.get('/api/download', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }
    
    console.log(`[PROXY DOWNLOAD] Downloading: ${url}`);
    
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      timeout: 60000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const contentDisposition = response.headers['content-disposition'];
    const contentType = response.headers['content-type'];
    
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    
    if (contentDisposition) {
      res.setHeader('Content-Disposition', contentDisposition);
    } else {
      const filename = url.split('/').pop();
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    }
    
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    
    response.data.pipe(res);
    
  } catch (error) {
    console.error('[PROXY DOWNLOAD Error]:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to download file: ' + error.message 
    });
  }
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
      
      const proxyDownloadUrl = `/api/download?url=${encodeURIComponent(data.download.download_url)}`;
      
      res.json({
        success: true,
        data: {
          video_info: data.video_info,
          download: {
            ...data.download,
            download_url: proxyDownloadUrl
          }
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
      
      const proxyDownloadUrl = `/api/download?url=${encodeURIComponent(data.download.download_url)}`;
      
      res.json({
        success: true,
        data: {
          video_info: data.video_info,
          download: {
            ...data.download,
            download_url: proxyDownloadUrl
          }
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
  console.log(`📹 Using quality: 1080p for video downloads`);
});
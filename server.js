require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ============ FIXED CSP HEADERS ============
app.use((req, res, next) => {
  // Set security headers yang benar
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
    "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:; " +
    "img-src 'self' data: https: http: https://i.ytimg.com; " +
    "connect-src 'self' https://api.danuxy.com; " +
    "frame-src 'none'; " +
    "object-src 'none'"
  );
  
  // HSTS header
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // X-Frame-Options
  res.setHeader('X-Frame-Options', 'DENY');
  
  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Referrer-Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
});

app.use(cors({
  origin: ['https://ytdl.danuxy.com', 'https://www.ytdl.danuxy.com'],
  credentials: true
}));

app.use(express.json());
app.use(express.static('public'));

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
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

    console.log(`[MP4 Request] URL: ${url} - Quality: 1080p`);

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

// Serve robots.txt
app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

// Serve sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

// Handle all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔒 CSP Headers configured correctly`);
  console.log(`📹 Using quality: 1080p for video downloads`);
});
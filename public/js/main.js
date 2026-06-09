const API_BASE = '/api/youtube';
let progressInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('urlInput');
  const clearBtn = document.getElementById('clearBtn');
  const btnVideo = document.getElementById('btnVideo');
  const btnAudio = document.getElementById('btnAudio');
  const loading = document.getElementById('loading');
  const resultDiv = document.getElementById('result');
  const progressFill = document.getElementById('progressFill');
  const donateBtn = document.getElementById('donateBtn');
  const modal = document.getElementById('modal');
  const closeModal = document.getElementById('closeModal');
  
  // Clear input
  if (clearBtn) {
    urlInput.addEventListener('input', () => {
      clearBtn.style.display = urlInput.value ? 'flex' : 'none';
    });
    clearBtn.addEventListener('click', () => {
      urlInput.value = '';
      clearBtn.style.display = 'none';
      urlInput.focus();
    });
  }
  
  // Donation modal
  if (donateBtn && modal && closeModal) {
    donateBtn.addEventListener('click', () => {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });
    closeModal.addEventListener('click', () => {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });
  }
  
  function startProgress() {
    let progress = 0;
    if (progressInterval) clearInterval(progressInterval);
    for (let i = 1; i <= 4; i++) {
      const step = document.getElementById(`step${i}`);
      if (step) {
        step.classList.remove('active', 'completed');
        if (i === 1) step.classList.add('active');
      }
    }
    progressInterval = setInterval(() => {
      if (progress < 95) {
        progress += Math.random() * 12;
        if (progress > 95) progress = 95;
        if (progressFill) progressFill.style.width = `${progress}%`;
      }
      const stepIdx = Math.min(Math.floor(progress / 25) + 1, 4);
      for (let i = 1; i <= stepIdx; i++) {
        const step = document.getElementById(`step${i}`);
        if (step) {
          step.classList.remove('active');
          step.classList.add('completed');
        }
      }
      if (stepIdx < 4) {
        const next = document.getElementById(`step${stepIdx + 1}`);
        if (next) next.classList.add('active');
      }
    }, 700);
  }
  
  function completeProgress() {
    if (progressInterval) clearInterval(progressInterval);
    if (progressFill) progressFill.style.width = '100%';
    for (let i = 1; i <= 4; i++) {
      const step = document.getElementById(`step${i}`);
      if (step) {
        step.classList.remove('active');
        step.classList.add('completed');
      }
    }
  }
  
  function showLoading(show) {
    if (show) {
      loading.classList.remove('hidden');
      resultDiv.classList.add('hidden');
      startProgress();
      document.body.style.overflow = 'hidden';
    } else {
      loading.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }
  
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, (m) => {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }
  
  function formatViews(v) {
    if (!v) return null;
    if (typeof v === 'number') {
      if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
      if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
      return v.toString();
    }
    return v;
  }
  
  function getUrl() {
    let raw = urlInput.value.trim();
    if (!raw) throw new Error('Masukkan URL YouTube');
    if (!raw.includes('youtube.com') && !raw.includes('youtu.be')) {
      throw new Error('URL YouTube tidak valid');
    }
    return raw;
  }
  
  async function callAPI(endpoint, payload) {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Request failed');
    return data.data;
  }
  
  function renderResult(data, type) {
    const isMp4 = type === 'mp4';
    const vi = data.video_info || {};
    const dl = data.download || {};
    const title = vi.title || (isMp4 ? 'YouTube Video' : 'YouTube Audio');
    const thumb = vi.thumbnail || 'https://i.ytimg.com/vi/default/hqdefault.jpg';
    const channel = vi.channel || 'Unknown';
    const views = formatViews(vi.views_raw || vi.views);
    const duration = vi.duration || '';
    const quality = dl.quality || (isMp4 ? '1080p' : 'Audio');
    const size = dl.size_mb ? (dl.size_mb.includes('MB') ? dl.size_mb : `${dl.size_mb} MB`) : 'Unknown';
    const dlUrl = dl.download_url;
    const filename = dl.filename || `download.${isMp4 ? 'mp4' : 'mp3'}`;
    const downloadText = isMp4 ? 'Download Video' : 'Download Audio';
    
    const html = `
      <div class="result-card">
        <div class="preview">
          <div class="thumb">
            <img src="${thumb}" alt="Thumbnail" onerror="this.src='https://i.ytimg.com/vi/default/hqdefault.jpg'">
            ${duration ? `<span class="duration">${duration}</span>` : ''}
          </div>
          <div class="info">
            <div class="title">${escapeHtml(title)}</div>
            <div class="meta">
              <span><i class="fas fa-user"></i> ${escapeHtml(channel)}</span>
              ${views ? `<span><i class="fas fa-eye"></i> ${views}</span>` : ''}
              <span class="quality-chip"><i class="fas fa-tachometer-alt"></i> ${escapeHtml(quality)}</span>
            </div>
          </div>
        </div>
        <div class="file-info">
          <span><i class="fas fa-file"></i> ${escapeHtml(filename)}</span>
          <span>${escapeHtml(size)}</span>
        </div>
        <a href="${dlUrl}" class="download-link" download target="_blank"><i class="fas fa-download"></i> ${downloadText}</a>
        <div style="margin-top: 12px; font-size: 0.6rem; text-align: center; color: #71717a;">
          <i class="fas fa-shield-alt"></i> Download aman dari Danuxy Studio
        </div>
      </div>
    `;
    
    resultDiv.innerHTML = html;
    resultDiv.classList.remove('hidden');
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  
  function displayError(msg) {
    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = `<div class="error-msg"><i class="fas fa-exclamation-triangle"></i><div><strong>Error</strong><br>${escapeHtml(msg)}</div></div>`;
  }
  
  async function handleVideo() {
    try {
      const url = getUrl();
      showLoading(true);
      const res = await callAPI('ytmp4', { url });
      if (!res || !res.download || !res.download.download_url) throw new Error('Gagal memproses');
      completeProgress();
      setTimeout(() => { showLoading(false); renderResult(res, 'mp4'); }, 500);
    } catch (err) {
      completeProgress();
      setTimeout(() => { showLoading(false); displayError(err.message); }, 500);
    }
  }
  
  async function handleAudio() {
    try {
      const url = getUrl();
      showLoading(true);
      const res = await callAPI('ytmp3', { url });
      if (!res || !res.download || !res.download.download_url) throw new Error('Gagal memproses');
      completeProgress();
      setTimeout(() => { showLoading(false); renderResult(res, 'mp3'); }, 500);
    } catch (err) {
      completeProgress();
      setTimeout(() => { showLoading(false); displayError(err.message); }, 500);
    }
  }
  
  btnVideo.addEventListener('click', handleVideo);
  btnAudio.addEventListener('click', handleAudio);
  urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleVideo();
  });
});
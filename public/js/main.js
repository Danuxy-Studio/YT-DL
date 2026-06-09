(function() {
  'use strict';
  
  let urlInput, clearBtn, btnVideo, btnAudio, loadingDiv, resultDiv, progressFill;
  let progressInterval = null;
  let isProcessing = false;
  
  const API_BASE = '/api/youtube';
  
  document.addEventListener('DOMContentLoaded', () => {
    urlInput = document.getElementById('urlInput');
    clearBtn = document.getElementById('clearBtn');
    btnVideo = document.getElementById('btnVideo');
    btnAudio = document.getElementById('btnAudio');
    loadingDiv = document.getElementById('loading');
    resultDiv = document.getElementById('result');
    progressFill = document.getElementById('progressFill');
    
    if (!urlInput || !btnVideo || !btnAudio) return;
    
    if (clearBtn) {
      urlInput.addEventListener('input', () => {
        if (urlInput.value) {
          clearBtn.classList.remove('hidden');
        } else {
          clearBtn.classList.add('hidden');
        }
      });
      clearBtn.addEventListener('click', () => {
        urlInput.value = '';
        clearBtn.classList.add('hidden');
        urlInput.focus();
      });
    }
    
    btnVideo.addEventListener('click', () => handleDownload('mp4'));
    btnAudio.addEventListener('click', () => handleDownload('mp3'));
    urlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleDownload('mp4');
    });
    
    const donateBtn = document.getElementById('donateBtn');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('closeModal');
    
    if (donateBtn && modal && closeModal) {
      donateBtn.addEventListener('click', () => modal.classList.remove('hidden'));
      closeModal.addEventListener('click', () => modal.classList.add('hidden'));
      window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      });
    }
  });
  
  function getUrl() {
    const val = urlInput.value.trim();
    if (!val) throw new Error('Silakan masukkan URL YouTube terlebih dahulu');
    return val;
  }
  
  function showLoading(show) {
    if (show) {
      resultDiv.classList.add('hidden');
      loadingDiv.classList.remove('hidden');
      startProgress();
    } else {
      loadingDiv.classList.add('hidden');
      stopProgress();
    }
  }
  
  function startProgress() {
    if (!progressFill) return;
    let width = 0;
    progressFill.style.width = '0%';
    clearInterval(progressInterval);
    progressInterval = setInterval(() => {
      if (width >= 88) {
        clearInterval(progressInterval);
      } else {
        width += Math.random() * 4;
        if (width > 88) width = 88;
        progressFill.style.width = width + '%';
      }
    }, 200);
  }
  
  function completeProgress() {
    if (!progressFill) return;
    clearInterval(progressInterval);
    progressFill.style.width = '100%';
  }
  
  function stopProgress() {
    clearInterval(progressInterval);
  }
  
  async function callAPI(endpoint, body) {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const json = await response.json();
    if (!response.ok || !json.success) {
      throw new Error(json.message || 'Gagal merespons dari server API');
    }
    return json.data;
  }
  
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  }
  
  function renderResult(data, type) {
    if (!resultDiv) return;
    
    const title = data.title || 'YouTube Media Konten';
    const thumb = data.thumbnail || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300';
    const duration = data.duration || '--:--';
    const size = data.download?.size || 'Unknown Size';
    const dlUrl = data.download?.download_url || '#';
    const filename = data.download?.filename || (type === 'mp4' ? 'video.mp4' : 'audio.mp3');
    
    const qText = type === 'mp4' ? '1080p HD' : 'MP3 Audio';
    const downloadText = type === 'mp4' ? 'Download Video Sekarang' : 'Download Audio Sekarang';
    
    const html = `
      <div class="result-card">
        <div class="result-preview">
          <div class="result-thumb">
            <img src="${escapeHtml(thumb)}" alt="Thumbnail">
            <div class="duration-badge">${escapeHtml(duration)}</div>
          </div>
          <div class="result-info-box">
            <h3 class="result-title" title="${escapeHtml(title)}">${escapeHtml(title)}</h3>
            <div class="result-meta">
              <span class="quality-chip">${qText}</span>
              <span>Danuxy Server</span>
            </div>
          </div>
        </div>
        <div class="file-info">
          <span><i class="fa-solid fa-file-code"></i> ${escapeHtml(filename)}</span>
          <span><i class="fa-solid fa-database"></i> ${escapeHtml(size)}</span>
        </div>
        <a href="${dlUrl}" class="download-link" download target="_blank"><i class="fa-solid fa-download"></i> ${downloadText}</a>
        <div class="secure-note"><i class="fa-solid fa-shield-halved"></i> Unduhan terenkripsi aman dan bebas malware</div>
      </div>
    `;
    
    resultDiv.innerHTML = html;
    resultDiv.classList.remove('hidden');
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  
  function displayError(msg) {
    if (!resultDiv) return;
    resultDiv.innerHTML = `
      <div class="error">
        <i class="fa-solid fa-triangle-exclamation" style="margin-top:3px;"></i>
        <div><strong>Gagal Memproses</strong><br>${escapeHtml(msg)}</div>
      </div>
    `;
    resultDiv.classList.remove('hidden');
  }
  
  async function handleDownload(type) {
    if (isProcessing) return;
    isProcessing = true;
    
    try {
      const url = getUrl();
      showLoading(true);
      const endpoint = type === 'mp4' ? 'ytmp4' : 'ytmp3';
      const res = await callAPI(endpoint, { url });
      if (!res || !res.download || !res.download.download_url) throw new Error('Gagal memproses link unduhan');
      completeProgress();
      setTimeout(() => {
        showLoading(false);
        renderResult(res, type);
        isProcessing = false;
      }, 500);
    } catch (err) {
      completeProgress();
      setTimeout(() => {
        showLoading(false);
        displayError(err.message);
        isProcessing = false;
      }, 500);
    }
  }
})();

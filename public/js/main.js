// ============ MULTI LANGUAGE - BAHASA INDONESIA UTAMA ============
let currentLang = 'id';

const translations = {
  id: {
    // Header
    tagline: 'YouTube Downloader • Kualitas Terbaik 1080p',
    quality: 'Kualitas 1080p • Turun Otomatis',
    btnVideo: 'Download Video',
    btnAudio: 'Download Audio',
    placeholder: 'Tempel URL YouTube di sini...',
    // Loading
    loading: 'Memproses permintaan Anda...',
    step1: 'Verifikasi',
    step2: 'Ambil Data',
    step3: 'Memproses',
    step4: 'Siap',
    // How to Use
    howtoTitle: 'Cara Menggunakan Danuxy Studio',
    howtoStep1: 'Salin URL video YouTube dari browser',
    howtoStep2: 'Tempel URL di kolom input di atas',
    howtoStep3: 'Klik tombol "Download Video" atau "Download Audio"',
    howtoStep4: 'Tunggu proses dan klik tombol download untuk menyimpan',
    // Download button text
    downloadVideo: 'Download Video',
    downloadAudio: 'Download Audio',
    // Footer
    donate: 'Dukung Danuxy Studio',
    copyright: '© 2026 Danuxy Studio • Dibuat dengan',
    // Modal
    modalTitle: 'Dukung Danuxy Studio',
    modalDesc: 'Dukungan Anda membuat layanan ini tetap berjalan dan gratis untuk semua orang!',
    modalDonate: 'Donasi via Sociabuzz',
    // Error
    errorUrl: 'Masukkan URL YouTube terlebih dahulu',
    errorInvalid: 'URL YouTube tidak valid',
    errorProcess: 'Gagal memproses, silakan coba lagi',
    // Result
    secureNote: 'Download aman dari Danuxy Studio'
  },
  en: {
    // Header
    tagline: 'YouTube Downloader • Best Quality 1080p',
    quality: '1080p Quality • Auto Fallback',
    btnVideo: 'Download Video',
    btnAudio: 'Download Audio',
    placeholder: 'Paste YouTube URL here...',
    // Loading
    loading: 'Processing your request...',
    step1: 'Verify',
    step2: 'Fetch',
    step3: 'Process',
    step4: 'Ready',
    // How to Use
    howtoTitle: 'How to Use Danuxy Studio',
    howtoStep1: 'Copy YouTube video URL from browser',
    howtoStep2: 'Paste the URL in the input field above',
    howtoStep3: 'Click "Download Video" or "Download Audio" button',
    howtoStep4: 'Wait for processing and click download button to save',
    // Download button text
    downloadVideo: 'Download Video',
    downloadAudio: 'Download Audio',
    // Footer
    donate: 'Support Danuxy Studio',
    copyright: '© 2026 Danuxy Studio • Made with',
    // Modal
    modalTitle: 'Support Danuxy Studio',
    modalDesc: 'Your support keeps this service running and free for everyone!',
    modalDonate: 'Donate via Sociabuzz',
    // Error
    errorUrl: 'Please enter a YouTube URL',
    errorInvalid: 'Invalid YouTube URL',
    errorProcess: 'Failed to process, please try again',
    // Result
    secureNote: 'Secure download from Danuxy Studio'
  }
};

// Detect language (default Indonesia, English only for non-Indonesian users)
function detectLanguage() {
  const userLang = navigator.language || navigator.userLanguage;
  // Default ke Indonesia, English hanya jika user bukan dari Indonesia
  if (userLang.startsWith('id')) return 'id';
  return 'en';
}

// Apply all translations
function applyLanguage() {
  const t = translations[currentLang];
  if (!t) return;
  
  // Header
  const tagline = document.getElementById('taglineText');
  if (tagline) tagline.textContent = t.tagline;
  
  const qualityText = document.getElementById('qualityText');
  if (qualityText) qualityText.textContent = t.quality;
  
  const btnVideo = document.getElementById('btnVideoText');
  if (btnVideo) btnVideo.textContent = t.btnVideo;
  
  const btnAudio = document.getElementById('btnAudioText');
  if (btnAudio) btnAudio.textContent = t.btnAudio;
  
  const urlInput = document.getElementById('youtubeUrl');
  if (urlInput) urlInput.placeholder = t.placeholder;
  
  // Loading
  const loadingMsg = document.getElementById('loadingMsg');
  if (loadingMsg) loadingMsg.textContent = t.loading;
  
  const step1Span = document.querySelector('#step1 span');
  if (step1Span) step1Span.textContent = t.step1;
  
  const step2Span = document.querySelector('#step2 span');
  if (step2Span) step2Span.textContent = t.step2;
  
  const step3Span = document.querySelector('#step3 span');
  if (step3Span) step3Span.textContent = t.step3;
  
  const step4Span = document.querySelector('#step4 span');
  if (step4Span) step4Span.textContent = t.step4;
  
  // How to Use
  const howtoTitle = document.getElementById('howtoTitle');
  if (howtoTitle) howtoTitle.textContent = t.howtoTitle;
  
  const step1Text = document.getElementById('step1Text');
  if (step1Text) step1Text.textContent = t.howtoStep1;
  
  const step2Text = document.getElementById('step2Text');
  if (step2Text) step2Text.textContent = t.howtoStep2;
  
  const step3Text = document.getElementById('step3Text');
  if (step3Text) step3Text.textContent = t.howtoStep3;
  
  const step4Text = document.getElementById('step4Text');
  if (step4Text) step4Text.textContent = t.howtoStep4;
  
  // Footer
  const donateText = document.getElementById('donateText');
  if (donateText) donateText.textContent = t.donate;
  
  const copyright = document.getElementById('copyrightText');
  if (copyright) copyright.innerHTML = `${t.copyright} <i class="fas fa-heart"></i>`;
  
  // Modal
  const modalTitle = document.querySelector('#donationModal .modal-header h3 span');
  if (modalTitle) modalTitle.textContent = t.modalTitle;
  
  const modalDesc = document.getElementById('modalDesc');
  if (modalDesc) modalDesc.textContent = t.modalDesc;
  
  const modalDonateBtn = document.getElementById('modalDonateBtn');
  if (modalDonateBtn) modalDonateBtn.innerHTML = `<i class="fas fa-heart"></i> ${t.modalDonate} <i class="fas fa-external-link-alt"></i>`;
}

// ============ MAIN APPLICATION ============
const API_BASE = '/api/youtube';
let progressInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  // Set language (Indonesia default)
  currentLang = detectLanguage();
  applyLanguage();
  
  // DOM Elements
  const urlInput = document.getElementById('youtubeUrl');
  const clearBtn = document.getElementById('clearBtn');
  const btnVideo = document.getElementById('btnMp4');
  const btnAudio = document.getElementById('btnMp3');
  const loadingDiv = document.getElementById('loading');
  const resultDiv = document.getElementById('result');
  const progressFill = document.getElementById('progressFill');
  const progressPercent = document.getElementById('progressPercent');
  const donateBtn = document.getElementById('donateBtn');
  const modal = document.getElementById('donationModal');
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
  
  // Progress simulation
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
        updateProgress(progress);
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
        const nextStep = document.getElementById(`step${stepIdx + 1}`);
        if (nextStep) nextStep.classList.add('active');
      }
    }, 700);
  }
  
  function updateProgress(p) {
    if (progressFill) progressFill.style.width = `${p}%`;
    if (progressPercent) progressPercent.textContent = `${Math.floor(p)}%`;
  }
  
  function completeProgress() {
    if (progressInterval) clearInterval(progressInterval);
    updateProgress(100);
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
      loadingDiv.classList.remove('hidden');
      resultDiv.classList.add('hidden');
      startProgress();
      document.body.style.overflow = 'hidden';
    } else {
      loadingDiv.classList.add('hidden');
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
      if (v >= 1000000) return (v / 1000000).toFixed(1) + 'Jt';
      if (v >= 1000) return (v / 1000).toFixed(1) + 'Rb';
      return v.toString();
    }
    return v;
  }
  
  function getErrorMessage(type) {
    const t = translations[currentLang];
    switch(type) {
      case 'url': return t.errorUrl;
      case 'invalid': return t.errorInvalid;
      default: return t.errorProcess;
    }
  }
  
  function getUrl() {
    let raw = urlInput.value.trim();
    if (!raw) throw new Error(getErrorMessage('url'));
    if (!raw.includes('youtube.com') && !raw.includes('youtu.be')) {
      throw new Error(getErrorMessage('invalid'));
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
    if (!res.ok || !data.success) throw new Error(data.message || getErrorMessage());
    return data.data;
  }
  
  function renderResult(data, type) {
    const t = translations[currentLang];
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
    const downloadText = isMp4 ? t.downloadVideo : t.downloadAudio;
    
    const html = `
      <div class="result-card">
        <div class="result-preview">
          <div class="result-thumb">
            <img src="${thumb}" alt="Thumbnail" onerror="this.src='https://i.ytimg.com/vi/default/hqdefault.jpg'">
            ${duration ? `<span class="result-duration">${duration}</span>` : ''}
          </div>
          <div class="result-info">
            <div class="result-title">${escapeHtml(title)}</div>
            <div class="result-meta">
              <span class="meta-chip"><i class="fas fa-user"></i> ${escapeHtml(channel)}</span>
              ${views ? `<span class="meta-chip"><i class="fas fa-eye"></i> ${views}</span>` : ''}
              <span class="quality-chip"><i class="fas fa-tachometer-alt"></i> ${escapeHtml(quality)}</span>
            </div>
          </div>
        </div>
        <div class="result-file">
          <i class="fas fa-file"></i> ${escapeHtml(filename)} <span style="margin-left: auto;">${escapeHtml(size)}</span>
        </div>
        <a href="${dlUrl}" class="download-link" download target="_blank"><i class="fas fa-download"></i> ${downloadText}</a>
        <div class="secure-note">
          <i class="fas fa-shield-alt"></i> ${t.secureNote}
        </div>
      </div>
    `;
    
    resultDiv.innerHTML = html;
    resultDiv.classList.remove('hidden');
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  
  function displayError(msg) {
    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = `<div class="error-msg"><i class="fas fa-exclamation-triangle"></i><div><strong>Error</strong><br><span>${escapeHtml(msg)}</span></div></div>`;
  }
  
  async function handleVideo() {
    try {
      const url = getUrl();
      showLoading(true);
      const res = await callAPI('ytmp4', { url });
      if (!res || !res.download || !res.download.download_url) throw new Error(getErrorMessage());
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
      if (!res || !res.download || !res.download.download_url) throw new Error(getErrorMessage());
      completeProgress();
      setTimeout(() => { showLoading(false); renderResult(res, 'mp3'); }, 500);
    } catch (err) {
      completeProgress();
      setTimeout(() => { showLoading(false); displayError(err.message); }, 500);
    }
  }
  
  btnVideo.addEventListener('click', handleVideo);
  btnAudio.addEventListener('click', handleAudio);
  urlInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleVideo(); });
});
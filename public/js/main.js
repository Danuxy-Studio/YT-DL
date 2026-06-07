// ============ AUTO LANGUAGE DETECTION ============
let currentLang='id';
const translations={id:{tagline:'YouTube Downloader',btnVideo:'Download Video',btnAudio:'Download Audio',infoNote:'Kualitas 1080p (turun otomatis jika tidak tersedia)',howtoTitle:'Cara Menggunakan',step1:'Salin URL video YouTube dari browser',step2:'Tempel URL di kolom input di atas',step3:'Klik tombol Download Video atau Download Audio',step4:'Tunggu proses dan klik tombol download',loadingVideo:'Memproses Video...',loadingAudio:'Memproses Audio...',loadingSubtitle:'Menghubungkan ke server',stepVerify:'Verifikasi',stepFetch:'Ambil Data',stepProcess:'Proses',stepReady:'Siap',donateText:'Dukung Kami',donationTitle:'Dukung Danuxy Studio',donationDesc:'Dukungan Anda membuat layanan ini tetap berjalan dan gratis untuk semua orang!',contactTitle:'Hubungi Kami',copyright:'© 2025 Danuxy Studio'},en:{tagline:'YouTube Downloader',btnVideo:'Download Video',btnAudio:'Download Audio',infoNote:'1080p quality (auto fallback if unavailable)',howtoTitle:'How to Use',step1:'Copy YouTube video URL from browser',step2:'Paste the URL in the input field above',step3:'Click "Download Video" or "Download Audio" button',step4:'Wait for processing and click download button',loadingVideo:'Processing Video...',loadingAudio:'Processing Audio...',loadingSubtitle:'Connecting to server',stepVerify:'Verify',stepFetch:'Fetch',stepProcess:'Process',stepReady:'Ready',donateText:'Support Us',donationTitle:'Support Danuxy Studio',donationDesc:'Your support keeps this service running and free for everyone!',contactTitle:'Contact Us',copyright:'© 2025 Danuxy Studio'}};

function detectLanguage(){const a=navigator.language||navigator.userLanguage;return a.startsWith('id')?'id':'en'}
function applyTranslations(a){const b=translations[a];if(!b)return;const c=document.getElementById('siteTagline');if(c)c.textContent=b.tagline;const d=document.getElementById('btnVideoText');if(d)d.textContent=b.btnVideo;const e=document.getElementById('btnAudioText');if(e)e.textContent=b.btnAudio;const f=document.querySelector('#infoNote span');if(f)f.textContent=b.infoNote;const g=document.getElementById('howtoTitle');if(g)g.textContent=b.howtoTitle;const h=document.getElementById('step1Text');if(h)h.textContent=b.step1;const i=document.getElementById('step2Text');if(i)i.textContent=b.step2;const j=document.getElementById('step3Text');if(j)j.textContent=b.step3;const k=document.getElementById('step4Text');if(k)k.textContent=b.step4;const l=document.getElementById('stepLabel1');if(l)l.textContent=b.stepVerify;const m=document.getElementById('stepLabel2');if(m)m.textContent=b.stepFetch;const n=document.getElementById('stepLabel3');if(n)n.textContent=b.stepProcess;const o=document.getElementById('stepLabel4');if(o)o.textContent=b.stepReady;const p=document.getElementById('donateText');if(p)p.textContent=b.donateText;const q=document.getElementById('donationTitle');if(q)q.textContent=b.donationTitle;const r=document.getElementById('donationDesc');if(r)r.textContent=b.donationDesc;const s=document.getElementById('contactTitle');if(s)s.textContent=b.contactTitle;const t=document.getElementById('copyright');if(t)t.textContent=b.copyright}

// Tunggu DOM ready sebelum apply translations
document.addEventListener('DOMContentLoaded', () => {
  currentLang = detectLanguage();
  applyTranslations(currentLang);
});

// ============ MAIN APPLICATION ============
const API_BASE='/api/youtube';
let currentProgressInterval=null,currentStep=0;

// Tunggu DOM ready sebelum akses elemen
document.addEventListener('DOMContentLoaded', () => {
  const urlInput=document.getElementById('youtubeUrl');
  const clearBtn=document.getElementById('clearBtn');
  const btnMp4=document.getElementById('btnMp4');
  const btnMp3=document.getElementById('btnMp3');
  const loadingState=document.getElementById('loadingState');
  const resultState=document.getElementById('resultState');
  const progressFill=document.getElementById('progressFill');
  const progressText=document.getElementById('progressText');
  const loadingTitle=document.getElementById('loadingTitle');
  const loadingSubtitle=document.getElementById('loadingSubtitle');
  const loadingIcon=document.getElementById('loadingIcon');
  const donationBtn=document.getElementById('donationBtn');
  const donationModal=document.getElementById('donationModal');
  const closeModal=document.getElementById('closeModal');

  if (!urlInput || !btnMp4 || !btnMp3) {
    console.error('Required elements not found');
    return;
  }

  // Clear button
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

  // Donation Modal
  if (donationBtn && donationModal && closeModal) {
    donationBtn.addEventListener('click', () => {
      donationModal.classList.remove('hidden');
    });
    closeModal.addEventListener('click', () => {
      donationModal.classList.add('hidden');
    });
    donationModal.addEventListener('click', (e) => {
      if (e.target === donationModal) {
        donationModal.classList.add('hidden');
      }
    });
  }

  function startProgressSimulation() {
    let progress = 0;
    currentStep = 0;
    
    for (let i = 1; i <= 4; i++) {
      const step = document.getElementById(`step${i}`);
      if (step) {
        step.classList.remove('active', 'completed');
        if (i === 1) step.classList.add('active');
      }
    }
    
    if (currentProgressInterval) clearInterval(currentProgressInterval);
    
    currentProgressInterval = setInterval(() => {
      if (progress < 95) {
        progress += Math.random() * 10;
        if (progress > 95) progress = 95;
        updateProgress(progress);
      }
      
      const newStep = Math.min(Math.floor(progress / 25) + 1, 4);
      if (newStep > currentStep) {
        for (let i = 1; i <= newStep; i++) {
          const step = document.getElementById(`step${i}`);
          if (step) {
            step.classList.remove('active');
            step.classList.add('completed');
          }
        }
        if (newStep < 4) {
          const nextStep = document.getElementById(`step${newStep + 1}`);
          if (nextStep) nextStep.classList.add('active');
        }
        currentStep = newStep;
        
        const stepTexts = currentLang === 'id' 
          ? ['Memverifikasi URL...', 'Mengambil metadata...', 'Memproses...', 'Menyiapkan...']
          : ['Verifying URL...', 'Fetching metadata...', 'Processing...', 'Preparing...'];
        if (loadingSubtitle) loadingSubtitle.textContent = stepTexts[Math.min(newStep - 1, stepTexts.length - 1)];
      }
    }, 700);
  }

  function updateProgress(percent) {
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `${Math.floor(percent)}%`;
  }

  function completeProgress() {
    if (currentProgressInterval) clearInterval(currentProgressInterval);
    updateProgress(100);
    
    for (let i = 1; i <= 4; i++) {
      const step = document.getElementById(`step${i}`);
      if (step) {
        step.classList.remove('active');
        step.classList.add('completed');
      }
    }
    if (loadingTitle) loadingTitle.textContent = currentLang === 'id' ? 'Selesai!' : 'Complete!';
    if (loadingSubtitle) loadingSubtitle.textContent = currentLang === 'id' ? 'Menyiapkan download...' : 'Preparing your download...';
  }

  function resetProgress() {
    if (currentProgressInterval) clearInterval(currentProgressInterval);
    updateProgress(0);
  }

  function showLoading(show, type = '') {
    if (show) {
      if (loadingIcon) {
        if (type === 'mp4') loadingIcon.className = 'fas fa-video loading-icon';
        else loadingIcon.className = 'fas fa-music loading-icon';
      }
      if (loadingState) loadingState.classList.remove('hidden');
      if (resultState) resultState.classList.add('hidden');
      
      if (loadingTitle) {
        loadingTitle.textContent = type === 'mp4' 
          ? (currentLang === 'id' ? 'Memproses Video...' : 'Processing Video...')
          : (currentLang === 'id' ? 'Memproses Audio...' : 'Processing Audio...');
      }
      if (loadingSubtitle) loadingSubtitle.textContent = currentLang === 'id' ? 'Menghubungkan ke server' : 'Connecting to server';
      startProgressSimulation();
    } else {
      if (loadingState) loadingState.classList.add('hidden');
    }
  }

  function displayError(message) {
    resetProgress();
    if (resultState) {
      resultState.classList.remove('hidden');
      resultState.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-triangle" style="font-size:1.2rem"></i><div><strong>Error</strong><br><span style="font-size:.8rem">${escapeHtml(message)}</span></div></div>`;
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

  function formatViews(views) {
    if (!views) return 'Unknown';
    if (typeof views === 'number') {
      if (views >= 1e6) return (views / 1e6).toFixed(1) + 'M';
      if (views >= 1e3) return (views / 1e3).toFixed(1) + 'K';
      return views.toString();
    }
    return views;
  }

  async function callAPI(endpoint, payload) {
    try {
      const response = await fetch(`${API_BASE}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Request failed');
      return data.data;
    } catch (error) {
      throw new Error(error.message || 'Network error');
    }
  }

  function getUrl() {
    let rawUrl = urlInput.value.trim();
    if (!rawUrl) throw new Error(currentLang === 'id' ? 'Masukkan URL YouTube' : 'Please enter a YouTube URL');
    if (!rawUrl.includes('youtube.com') && !rawUrl.includes('youtu.be')) {
      throw new Error(currentLang === 'id' ? 'URL YouTube tidak valid' : 'Invalid YouTube URL');
    }
    return rawUrl;
  }

  function renderResult(data, type) {
    const isMp4 = type === 'mp4';
    const videoInfo = data.video_info || {};
    const downloadInfo = data.download || {};
    
    const title = videoInfo.title || (isMp4 ? 'YouTube Video' : 'YouTube Audio');
    const thumbnail = videoInfo.thumbnail || 'https://i.ytimg.com/vi/default/hqdefault.jpg';
    const channel = videoInfo.channel || 'Unknown';
    const views = formatViews(videoInfo.views_raw || videoInfo.views);
    const duration = videoInfo.duration || '';
    const uploadedAt = videoInfo.uploaded_at || '';
    const quality = downloadInfo.quality || (isMp4 ? '1080p' : 'Audio');
    const size = downloadInfo.size_mb ? (downloadInfo.size_mb.includes('MB') ? downloadInfo.size_mb : `${downloadInfo.size_mb} MB`) : 'Unknown';
    const expires = downloadInfo.expires_in || 'Permanent';
    const downloadUrl = downloadInfo.download_url;
    const filename = downloadInfo.filename || `download.${isMp4 ? 'mp4' : 'mp3'}`;
    
    const downloadText = currentLang === 'id' ? `Download ${isMp4 ? 'Video' : 'Audio'}` : `Download ${isMp4 ? 'Video' : 'Audio'}`;
    
    const resultHtml = `<div class="result-card"><div class="result-content"><div class="video-info"><div class="thumbnail"><img src="${thumbnail}" alt="Thumbnail" onerror="this.src='https://i.ytimg.com/vi/default/hqdefault.jpg'">${duration ? `<span class="duration">${duration}</span>` : ''}</div><div class="details"><div class="title">${escapeHtml(title)}</div><div class="meta"><span class="meta-item"><i class="fas fa-user"></i> ${escapeHtml(channel)}</span>${views !== 'Unknown' ? `<span class="meta-item"><i class="fas fa-eye"></i> ${views}</span>` : ''}${uploadedAt ? `<span class="meta-item"><i class="fas fa-calendar"></i> ${escapeHtml(uploadedAt)}</span>` : ''}</div><div class="meta"><span class="meta-item"><i class="fas ${isMp4 ? 'fa-video' : 'fa-music'}"></i> ${isMp4 ? 'Video' : 'Audio'}</span><span class="meta-item"><i class="fas fa-database"></i> ${escapeHtml(size)}</span><span class="quality-badge"><i class="fas fa-tachometer-alt"></i> ${escapeHtml(quality)}</span></div></div></div><div class="download-info"><div class="filename"><i class="fas fa-file"></i><span>${escapeHtml(filename)}</span></div></div><a href="${downloadUrl}" class="download-btn" download target="_blank"><i class="fas fa-download"></i> ${downloadText}</a>${expires !== 'Permanent' ? `<div class="expiry-note"><i class="fas fa-clock"></i> ${currentLang === 'id' ? `Link kadaluarsa dalam ${expires}` : `Link expires in ${expires}`}</div>` : ''}<div class="secure-note"><i class="fas fa-shield-alt"></i> ${currentLang === 'id' ? 'Download aman dari Danuxy Studio' : 'Secure download from Danuxy Studio'}</div></div></div>`;
    
    if (resultState) {
      resultState.innerHTML = resultHtml;
      resultState.classList.remove('hidden');
    }
  }

  async function handleMp4() {
    try {
      const url = getUrl();
      showLoading(true, 'mp4');
      const result = await callAPI('ytmp4', { url });
      if (!result || !result.download || !result.download.download_url) throw new Error('Invalid response');
      completeProgress();
      setTimeout(() => { showLoading(false); renderResult(result, 'mp4'); }, 500);
    } catch (error) {
      completeProgress();
      setTimeout(() => { showLoading(false); displayError(error.message || (currentLang === 'id' ? 'Gagal memproses video' : 'Failed to process video')); }, 500);
    }
  }

  async function handleMp3() {
    try {
      const url = getUrl();
      showLoading(true, 'mp3');
      const result = await callAPI('ytmp3', { url });
      if (!result || !result.download || !result.download.download_url) throw new Error('Invalid response');
      completeProgress();
      setTimeout(() => { showLoading(false); renderResult(result, 'mp3'); }, 500);
    } catch (error) {
      completeProgress();
      setTimeout(() => { showLoading(false); displayError(error.message || (currentLang === 'id' ? 'Gagal memproses audio' : 'Failed to process audio')); }, 500);
    }
  }

  btnMp4.addEventListener('click', handleMp4);
  btnMp3.addEventListener('click', handleMp3);
  urlInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleMp4(); });
  
  if (clearBtn) clearBtn.style.display = urlInput.value ? 'flex' : 'none';
});
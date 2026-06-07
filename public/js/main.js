// ============ AUTO LANGUAGE DETECTION ============
let currentLang = "id";

const translations = {
    id: {
        tagline: "YouTube Downloader",
        btnVideo: "Download Video",
        btnAudio: "Download Audio",
        howtoTitle: "Cara Menggunakan",
        step1: "Salin URL video YouTube dari browser",
        step2: "Tempel URL di kolom input di atas",
        step3: "Klik tombol Download Video atau Download Audio",
        step4: "Tunggu proses dan klik tombol download",
        loadingVideo: "Memproses Video...",
        loadingAudio: "Memproses Audio...",
        loadingSubtitle: "Menghubungkan ke server",
        stepVerify: "Verifikasi",
        stepFetch: "Ambil Data",
        stepProcess: "Proses",
        stepReady: "Siap",
        donateText: "Dukung Kami",
        donationTitle: "Dukung Danuxy Studio",
        donationDesc:
            "Dukungan Anda membuat layanan ini tetap berjalan dan gratis!",
        contactTitle: "Hubungi Kami",
        copyright: "© 2025 Danuxy Studio"
    },
    en: {
        tagline: "YouTube Downloader",
        btnVideo: "Download Video",
        btnAudio: "Download Audio",
        howtoTitle: "How to Use",
        step1: "Copy YouTube video URL from browser",
        step2: "Paste the URL in the input field above",
        step3: 'Click "Download Video" or "Download Audio" button',
        step4: "Wait for processing and click download button",
        loadingVideo: "Processing Video...",
        loadingAudio: "Processing Audio...",
        loadingSubtitle: "Connecting to server",
        stepVerify: "Verify",
        stepFetch: "Fetch",
        stepProcess: "Process",
        stepReady: "Ready",
        donateText: "Support Us",
        donationTitle: "Support Danuxy Studio",
        donationDesc:
            "Your support keeps this service running and free for everyone!",
        contactTitle: "Contact Us",
        copyright: "© 2025 Danuxy Studio"
    }
};

function detectLanguage() {
    const userLang = navigator.language || navigator.userLanguage;
    return userLang.startsWith("id") ? "id" : "en";
}

function applyTranslations(lang) {
    const t = translations[lang];
    if (!t) return;

    const elements = {
        siteTagline: t.tagline,
        btnVideoText: t.btnVideo,
        btnAudioText: t.btnAudio,
        howtoTitle: t.howtoTitle,
        step1Text: t.step1,
        step2Text: t.step2,
        step3Text: t.step3,
        step4Text: t.step4,
        stepLabel1: t.stepVerify,
        stepLabel2: t.stepFetch,
        stepLabel3: t.stepProcess,
        stepLabel4: t.stepReady,
        donateText: t.donateText,
        donationTitle: t.donationTitle,
        donationDesc: t.donationDesc,
        contactTitle: t.contactTitle,
        copyright: t.copyright
    };

    for (const [id, text] of Object.entries(elements)) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }
}

// ============ MAIN APPLICATION ============
const API_BASE = "/api/youtube";
let currentProgressInterval = null;
let currentStep = 0;

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // Set language
    currentLang = detectLanguage();
    applyTranslations(currentLang);

    // DOM Elements
    const urlInput = document.getElementById("youtubeUrl");
    const clearBtn = document.getElementById("clearBtn");
    const btnMp4 = document.getElementById("btnMp4");
    const btnMp3 = document.getElementById("btnMp3");
    const loadingState = document.getElementById("loadingState");
    const resultState = document.getElementById("resultState");
    const progressFill = document.getElementById("progressFill");
    const progressText = document.getElementById("progressText");
    const loadingTitle = document.getElementById("loadingTitle");
    const loadingSubtitle = document.getElementById("loadingSubtitle");
    const loadingIcon = document.getElementById("loadingIcon");
    const donationBtn = document.getElementById("donationBtn");
    const donationModal = document.getElementById("donationModal");
    const closeModal = document.getElementById("closeModal");

    if (!urlInput || !btnMp4 || !btnMp3) {
        console.error("Required elements not found");
        return;
    }

    // Clear button functionality
    const updateClearBtn = () => {
        if (clearBtn) {
            clearBtn.style.display = urlInput.value ? "flex" : "none";
        }
    };

    urlInput.addEventListener("input", updateClearBtn);
    updateClearBtn();

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            urlInput.value = "";
            clearBtn.style.display = "none";
            urlInput.focus();
        });
    }

    // Donation Modal
    if (donationBtn && donationModal && closeModal) {
        donationBtn.addEventListener("click", () => {
            donationModal.classList.remove("hidden");
            document.body.style.overflow = "hidden";
        });

        closeModal.addEventListener("click", () => {
            donationModal.classList.add("hidden");
            document.body.style.overflow = "";
        });

        donationModal.addEventListener("click", e => {
            if (e.target === donationModal) {
                donationModal.classList.add("hidden");
                document.body.style.overflow = "";
            }
        });
    }

    // Progress simulation
    function startProgressSimulation() {
        let progress = 0;
        currentStep = 0;

        for (let i = 1; i <= 4; i++) {
            const step = document.getElementById(`step${i}`);
            if (step) {
                step.classList.remove("active", "completed");
                if (i === 1) step.classList.add("active");
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
                        step.classList.remove("active");
                        step.classList.add("completed");
                    }
                }
                if (newStep < 4) {
                    const nextStep = document.getElementById(
                        `step${newStep + 1}`
                    );
                    if (nextStep) nextStep.classList.add("active");
                }
                currentStep = newStep;

                const stepTexts =
                    currentLang === "id"
                        ? [
                              "Memverifikasi URL...",
                              "Mengambil metadata...",
                              "Memproses...",
                              "Menyiapkan..."
                          ]
                        : [
                              "Verifying URL...",
                              "Fetching metadata...",
                              "Processing...",
                              "Preparing..."
                          ];
                if (loadingSubtitle) {
                    loadingSubtitle.textContent =
                        stepTexts[Math.min(newStep - 1, stepTexts.length - 1)];
                }
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
                step.classList.remove("active");
                step.classList.add("completed");
            }
        }
        if (loadingTitle) {
            loadingTitle.textContent =
                currentLang === "id" ? "Selesai!" : "Complete!";
        }
        if (loadingSubtitle) {
            loadingSubtitle.textContent =
                currentLang === "id"
                    ? "Menyiapkan download..."
                    : "Preparing your download...";
        }
    }

    function resetProgress() {
        if (currentProgressInterval) clearInterval(currentProgressInterval);
        updateProgress(0);
    }

    function showLoading(show, type = "") {
        if (show) {
            if (loadingIcon) {
                if (type === "mp4") {
                    loadingIcon.className = "fas fa-video loading-icon";
                } else {
                    loadingIcon.className = "fas fa-music loading-icon";
                }
            }
            if (loadingState) loadingState.classList.remove("hidden");
            if (resultState) resultState.classList.add("hidden");

            if (loadingTitle) {
                loadingTitle.textContent =
                    type === "mp4"
                        ? currentLang === "id"
                            ? "Memproses Video..."
                            : "Processing Video..."
                        : currentLang === "id"
                          ? "Memproses Audio..."
                          : "Processing Audio...";
            }
            if (loadingSubtitle) {
                loadingSubtitle.textContent =
                    currentLang === "id"
                        ? "Menghubungkan ke server"
                        : "Connecting to server";
            }
            startProgressSimulation();
        } else {
            if (loadingState) loadingState.classList.add("hidden");
        }
    }

    function displayError(message) {
        resetProgress();
        if (resultState) {
            resultState.classList.remove("hidden");
            resultState.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle" style="font-size: 1.2rem;"></i>
          <div>
            <strong>Error</strong><br>
            <span style="font-size: 0.8rem;">${escapeHtml(message)}</span>
          </div>
        </div>
      `;
        }
    }

    function escapeHtml(str) {
        if (!str) return "";
        return String(str).replace(/[&<>]/g, m => {
            if (m === "&") return "&amp;";
            if (m === "<") return "&lt;";
            if (m === ">") return "&gt;";
            return m;
        });
    }

    function formatViews(views) {
        if (!views) return "Unknown";
        if (typeof views === "number") {
            if (views >= 1000000) return (views / 1000000).toFixed(1) + "M";
            if (views >= 1000) return (views / 1000).toFixed(1) + "K";
            return views.toString();
        }
        return views;
    }

    async function callAPI(endpoint, payload) {
        try {
            const response = await fetch(`${API_BASE}/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || "Request failed");
            }
            return data.data;
        } catch (error) {
            console.error("API Error:", error);
            throw new Error(
                error.message || "Network error. Please check your connection."
            );
        }
    }

    function getUrl() {
        let rawUrl = urlInput.value.trim();
        if (!rawUrl) {
            throw new Error(
                currentLang === "id"
                    ? "Masukkan URL YouTube"
                    : "Please enter a YouTube URL"
            );
        }
        if (!rawUrl.includes("youtube.com") && !rawUrl.includes("youtu.be")) {
            throw new Error(
                currentLang === "id"
                    ? "URL YouTube tidak valid"
                    : "Invalid YouTube URL"
            );
        }
        return rawUrl;
    }

    function renderResult(data, type) {
        const isMp4 = type === "mp4";
        const videoInfo = data.video_info || {};
        const downloadInfo = data.download || {};

        const title =
            videoInfo.title || (isMp4 ? "YouTube Video" : "YouTube Audio");
        const thumbnail =
            videoInfo.thumbnail ||
            "https://i.ytimg.com/vi/default/hqdefault.jpg";
        const channel = videoInfo.channel || "Unknown";
        const views = formatViews(videoInfo.views_raw || videoInfo.views);
        const duration = videoInfo.duration || "";
        const uploadedAt = videoInfo.uploaded_at || "";
        const quality = downloadInfo.quality || (isMp4 ? "1080p" : "Audio");
        const size = downloadInfo.size_mb
            ? downloadInfo.size_mb.includes("MB")
                ? downloadInfo.size_mb
                : `${downloadInfo.size_mb} MB`
            : "Unknown";
        const expires = downloadInfo.expires_in || "Permanent";
        const downloadUrl = downloadInfo.download_url;
        const filename =
            downloadInfo.filename || `download.${isMp4 ? "mp4" : "mp3"}`;

        const downloadText =
            currentLang === "id"
                ? `Download ${isMp4 ? "Video" : "Audio"}`
                : `Download ${isMp4 ? "Video" : "Audio"}`;

        const resultHtml = `
      <div class="result-card">
        <div class="result-content">
          <div class="video-info">
            <div class="thumbnail">
              <img src="${thumbnail}" alt="Thumbnail" onerror="this.src='https://i.ytimg.com/vi/default/hqdefault.jpg'">
              ${duration ? `<span class="duration">${duration}</span>` : ""}
            </div>
            <div class="details">
              <div class="title">${escapeHtml(title)}</div>
              <div class="meta">
                <span class="meta-item"><i class="fas fa-user"></i> ${escapeHtml(channel)}</span>
                ${views !== "Unknown" ? `<span class="meta-item"><i class="fas fa-eye"></i> ${views}</span>` : ""}
                ${uploadedAt ? `<span class="meta-item"><i class="fas fa-calendar"></i> ${escapeHtml(uploadedAt)}</span>` : ""}
              </div>
              <div class="meta">
                <span class="meta-item"><i class="fas ${isMp4 ? "fa-video" : "fa-music"}"></i> ${isMp4 ? "Video" : "Audio"}</span>
                <span class="meta-item"><i class="fas fa-database"></i> ${escapeHtml(size)}</span>
                <span class="quality-badge-result"><i class="fas fa-tachometer-alt"></i> ${escapeHtml(quality)}</span>
              </div>
            </div>
          </div>
          <div class="download-info">
            <div class="filename">
              <i class="fas fa-file"></i>
              <span>${escapeHtml(filename)}</span>
            </div>
          </div>
          <a href="${downloadUrl}" class="download-btn" download target="_blank">
            <i class="fas fa-download"></i> ${downloadText}
          </a>
          ${
              expires !== "Permanent"
                  ? `
            <div class="expiry-note">
              <i class="fas fa-clock"></i> ${currentLang === "id" ? `Link kadaluarsa dalam ${expires}` : `Link expires in ${expires}`}
            </div>
          `
                  : ""
          }
          <div class="secure-note">
            <i class="fas fa-shield-alt"></i> ${currentLang === "id" ? "Download aman dari Danuxy Studio" : "Secure download from Danuxy Studio"}
          </div>
        </div>
      </div>
    `;

        if (resultState) {
            resultState.innerHTML = resultHtml;
            resultState.classList.remove("hidden");

            // Scroll ke result dengan smooth
            setTimeout(() => {
                resultState.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });
            }, 100);
        }
    }

    async function handleMp4() {
        try {
            const url = getUrl();
            showLoading(true, "mp4");
            const result = await callAPI("ytmp4", { url });

            if (!result || !result.download || !result.download.download_url) {
                throw new Error("Invalid response from server");
            }

            completeProgress();
            setTimeout(() => {
                showLoading(false);
                renderResult(result, "mp4");
            }, 500);
        } catch (error) {
            completeProgress();
            setTimeout(() => {
                showLoading(false);
                displayError(
                    error.message ||
                        (currentLang === "id"
                            ? "Gagal memproses video. Silakan coba lagi."
                            : "Failed to process video. Please try again.")
                );
            }, 500);
        }
    }

    async function handleMp3() {
        try {
            const url = getUrl();
            showLoading(true, "mp3");
            const result = await callAPI("ytmp3", { url });

            if (!result || !result.download || !result.download.download_url) {
                throw new Error("Invalid response from server");
            }

            completeProgress();
            setTimeout(() => {
                showLoading(false);
                renderResult(result, "mp3");
            }, 500);
        } catch (error) {
            completeProgress();
            setTimeout(() => {
                showLoading(false);
                displayError(
                    error.message ||
                        (currentLang === "id"
                            ? "Gagal memproses audio. Silakan coba lagi."
                            : "Failed to process audio. Please try again.")
                );
            }, 500);
        }
    }

    // Event listeners
    btnMp4.addEventListener("click", handleMp4);
    btnMp3.addEventListener("click", handleMp3);
    urlInput.addEventListener("keypress", e => {
        if (e.key === "Enter") handleMp4();
    });
});

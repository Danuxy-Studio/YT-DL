require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "https://cdnjs.cloudflare.com",
                    "https://fonts.googleapis.com"
                ],
                scriptSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "https://cdnjs.cloudflare.com"
                ],
                fontSrc: [
                    "'self'",
                    "https://cdnjs.cloudflare.com",
                    "https://fonts.gstatic.com"
                ],
                imgSrc: ["'self'", "data:", "https:", "https://i.ytimg.com"]
            }
        }
    })
);

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        success: false,
        message: "Too many requests, please try again later."
    }
});
app.use("/api/", limiter);

// Proxy endpoint untuk MP4 dengan quality "1080p"
app.post("/api/youtube/ytmp4", async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res
                .status(400)
                .json({ success: false, message: "URL is required" });
        }

        console.log(
            `[MP4 Request] URL: ${url} - Quality: 1080p (auto fallback)`
        );

        // Menggunakan quality "1080p" - API akan otomatis turun ke kualitas terendah yang tersedia
        const response = await axios.post(
            `${process.env.API_BASE_URL}/ytmp4`,
            {
                url: url,
                quality: "1080p"
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": process.env.API_KEY
                },
                timeout: 30000
            }
        );

        if (response.data && response.data.success === true) {
            const data = response.data.data;

            if (!data || !data.download || !data.download.download_url) {
                console.error(
                    "[MP4 Error]: Invalid data structure",
                    response.data
                );
                return res.status(500).json({
                    success: false,
                    message: "Invalid response from API service"
                });
            }

            console.log(
                `[MP4 Success] Title: ${data.video_info?.title || "Unknown"}, Quality: ${data.download?.quality || "1080p/auto"}`
            );

            res.json({
                success: true,
                data: {
                    video_info: data.video_info,
                    download: data.download
                }
            });
        } else {
            throw new Error(
                response.data?.message || "Failed to process video"
            );
        }
    } catch (error) {
        console.error("[MP4 Error]:", error.message);
        res.status(500).json({
            success: false,
            message:
                error.response?.data?.message ||
                error.message ||
                "Failed to process video. Please try again."
        });
    }
});

// Proxy endpoint untuk MP3
app.post("/api/youtube/ytmp3", async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res
                .status(400)
                .json({ success: false, message: "URL is required" });
        }

        console.log(`[MP3 Request] URL: ${url}`);

        const response = await axios.post(
            `${process.env.API_BASE_URL}/ytmp3`,
            {
                url: url
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": process.env.API_KEY
                },
                timeout: 30000
            }
        );

        if (response.data && response.data.success === true) {
            const data = response.data.data;

            if (!data || !data.download || !data.download.download_url) {
                console.error(
                    "[MP3 Error]: Invalid data structure",
                    response.data
                );
                return res.status(500).json({
                    success: false,
                    message: "Invalid response from API service"
                });
            }

            console.log(
                `[MP3 Success] Title: ${data.video_info?.title || "Unknown"}`
            );

            res.json({
                success: true,
                data: {
                    video_info: data.video_info,
                    download: data.download
                }
            });
        } else {
            throw new Error(
                response.data?.message || "Failed to process audio"
            );
        }
    } catch (error) {
        console.error("[MP3 Error]:", error.message);
        res.status(500).json({
            success: false,
            message:
                error.response?.data?.message ||
                error.message ||
                "Failed to process audio. Please try again."
        });
    }
});

app.get("/api/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Handle all other routes - untuk Vercel compatibility
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Server Error:", err.stack);
    res.status(500).json({
        success: false,
        message: "Internal server error. Please try again later."
    });
});

app.listen(PORT, () => {
    console.log(
        `🚀 Danuxy Studio Downloader running on http://localhost:${PORT}`
    );
});

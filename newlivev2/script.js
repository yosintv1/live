// Copyright © 2025 YoSinTV. All rights reserved. Unauthorized copying prohibited.

// Domain restriction
(function() {
    const allowedDomains = ['yosin-tv.net', 'www.yosin-tv.net', 'localhost'];
    if (!allowedDomains.includes(window.location.hostname)) {
        return; // Exit if domain is not allowed
    }

    // Apply initial theme
    const mode = localStorage.getItem('mode') || 'light';
    document.body.classList.add(`theme-${mode}`);
})();

document.addEventListener('DOMContentLoaded', function() {
    let shortenedUrl = '';
    let displayUrl = '';

    function startAdCountdown() {
        try {
            const adOverlay = document.querySelector('.ad-overlay');
            const adCountdown = document.querySelector('.ad-countdown');
            const adPlaceholder = document.querySelector('.ad-placeholder');

            if (!adOverlay || !adCountdown || !adPlaceholder) {
                throw new Error("Ad elements not found");
            }

            let timeLeft = 10;
            adCountdown.textContent = `Please Wait ${timeLeft} Seconds`;

            const countdown = setInterval(() => {
                timeLeft--;
                adCountdown.textContent = `Please Wait ${timeLeft} Seconds`;
                if (timeLeft <= 0) {
                    clearInterval(countdown);
                    skipAd();
                }
            }, 1000);

            // Check if ad loaded
            setTimeout(() => {
                const adIframe = adPlaceholder.querySelector('iframe');
                if (!adIframe || !adIframe.contentWindow) {
                    console.warn("Ad iframe not loaded; skipping ad");
                    skipAd();
                }
            }, 3000); // Wait 3 seconds to check ad load
        } catch (error) {
            console.error("startAdCountdown error:", error);
            skipAd(); // Fallback to player if ad fails
        }
    }

    function skipAd() {
        try {
            const adOverlay = document.querySelector('.ad-overlay');
            const iframe = document.getElementById('iframe');
            const jwPlayer = document.getElementById('jwPlayer');

            if (!adOverlay || !iframe || !jwPlayer) {
                throw new Error("Ad or player elements not found");
            }

            adOverlay.style.display = 'none';
            initializePlayer(); // Load player after ad
            if (iframe.src) {
                iframe.style.display = 'block';
            } else if (jwPlayer.getAttribute('data-video-url')) {
                jwPlayer.style.display = 'block';
            }
        } catch (error) {
            console.error("skipAd error:", error);
        }
    }

    function loadShareLink() {
        try {
            const originalUrl = window.location.href;
            const url = new URL(originalUrl);
            const srcParam = url.searchParams.get('src');
            let displayUrlBase = originalUrl;

            if (srcParam) {
                const decodedSrc = decodeURIComponent(srcParam);
                displayUrlBase = originalUrl.replace(srcParam, decodedSrc);
            }
            displayUrl = decodeURIComponent(displayUrlBase);

            const apiUrl = 'https://tinyurl.com/api-create.php?url=' + encodeURIComponent(originalUrl);

            fetch(apiUrl)
                .then(response => response.text())
                .then(shortUrl => {
                    shortenedUrl = shortUrl;
                    const shortUrlObj = new URL(shortUrl);
                    const shortSrcParam = shortUrlObj.searchParams.get('src');
                    if (shortSrcParam) {
                        const decodedShortSrc = decodeURIComponent(shortSrcParam);
                        displayUrl = shortUrl.replace(shortSrcParam, decodedShortSrc);
                        displayUrl = decodeURIComponent(displayUrl);
                    } else {
                        displayUrl = decodeURIComponent(shortUrl);
                    }
                    const shareLinkBox = document.getElementById("shareLinkBox");
                    if (shareLinkBox) shareLinkBox.textContent = displayUrl;
                })
                .catch(error => {
                    shortenedUrl = originalUrl;
                    const shareLinkBox = document.getElementById("shareLinkBox");
                    if (shareLinkBox) shareLinkBox.textContent = displayUrl;
                    console.error("Shortening failed:", error);
                });
        } catch (error) {
            console.error("loadShareLink error:", error);
        }
    }

    function copyToClipboard() {
        try {
            const shareLinkBox = document.getElementById("shareLinkBox");
            if (!shareLinkBox) throw new Error("shareLinkBox not found");
            const text = shareLinkBox.textContent;
            navigator.clipboard.writeText(text).then(() => {
                alert("Link copied to clipboard!");
            }).catch(error => {
                console.error("Copy failed:", error);
                alert("Failed to copy link. Please select and copy manually.");
            });
        } catch (error) {
            console.error("copyToClipboard error:", error);
        }
    }

    function shareTo(platform) {
        try {
            const text = encodeURIComponent("Check out this live stream on YoSinTV!");
            const url = encodeURIComponent(shortenedUrl || window.location.href);
            let shareUrl;

            switch (platform) {
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                    break;
                case 'whatsapp':
                    shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
                    break;
                case 'instagram':
                    navigator.clipboard.writeText(displayUrl).then(() => {
                        alert("Instagram doesn't support direct web sharing. Link copied to clipboard! Open Instagram, create a story or post, and paste the link.");
                    }).catch(error => {
                        console.error("Copy failed:", error);
                        alert("Failed to copy link for Instagram. Please select and copy manually.");
                    });
                    return;
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
                    break;
                case 'telegram':
                    shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
                    break;
                case 'messenger':
                    shareUrl = `https://www.facebook.com/dialog/send?link=${url}&app_id=YOUR_FACEBOOK_APP_ID&redirect_uri=${encodeURIComponent(window.location.href)}`;
                    break;
                default:
                    return;
            }

            window.open(shareUrl, '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error("shareTo error:", error);
        }
    }

    function rdmode() {
        try {
            console.log("rdmode called");
            const currentMode = localStorage.getItem("mode") || 'light';
            const newMode = currentMode === "dark" ? "light" : "dark";
            localStorage.setItem("mode", newMode);
            document.body.classList.remove('theme-light', 'theme-dark');
            document.body.classList.add(`theme-${newMode}`);
            const modeToggle = document.querySelector('.mode-toggle i');
            if (modeToggle) {
                modeToggle.classList.toggle('fa-moon', newMode === 'dark');
                modeToggle.classList.toggle('fa-sun', newMode === 'light');
            }
        } catch (error) {
            console.error("rdmode error:", error);
        }
    }

    function toggleFullscreen() {
        try {
            console.log("toggleFullscreen called");
            const playerWrapper = document.querySelector('.player-wrapper');
            const fullscreenButton = document.querySelector('.fullscreen-toggle i');
            const iframe = document.getElementById('iframe');
            const jwPlayer = document.getElementById('jwPlayer');

            if (!playerWrapper || !fullscreenButton || !iframe || !jwPlayer) {
                throw new Error("Required elements not found");
            }

            const requestFullscreen = element => {
                if (element.requestFullscreen) return element.requestFullscreen();
                if (element.mozRequestFullScreen) return element.mozRequestFullScreen();
                if (element.webkitRequestFullscreen) return element.webkitRequestFullscreen();
                if (element.msRequestFullscreen) return element.msRequestFullscreen();
                return Promise.reject(new Error("Fullscreen API not supported"));
            };

            const exitFullscreen = () => {
                if (document.exitFullscreen) return document.exitFullscreen();
                if (document.mozCancelFullScreen) return document.mozCancelFullScreen();
                if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
                if (document.msExitFullscreen) return document.msExitFullscreen();
                return Promise.reject(new Error("Exit fullscreen not supported"));
            };

            if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
                if (iframe.style.display !== 'none') {
                    requestFullscreen(iframe).catch(err => {
                        console.error("Iframe fullscreen error:", err);
                        requestFullscreen(playerWrapper).catch(err => {
                            console.error("Player wrapper fullscreen error:", err);
                            alert("Fullscreen mode not supported by your browser or stream source.");
                        });
                    });
                } else {
                    requestFullscreen(playerWrapper).catch(err => {
                        console.error("Player wrapper fullscreen error:", err);
                        alert("Fullscreen mode not supported by your browser.");
                    });
                }
                fullscreenButton.classList.remove('fa-expand');
                fullscreenButton.classList.add('fa-compress');
            } else {
                exitFullscreen().catch(err => {
                    console.error("Exit fullscreen error:", err);
                });
                fullscreenButton.classList.remove('fa-compress');
                fullscreenButton.classList.add('fa-expand');
            }
        } catch (error) {
            console.error("toggleFullscreen error:", error);
        }
    }

    function toggleChat() {
        try {
            console.log("toggleChat called");
            const chatSection = document.querySelector('.chat-section');
            const chatIframe = chatSection.querySelector('iframe');
            const chatButton = document.querySelector('.chat-toggle');
            const chatIcon = chatButton.querySelector('i');

            if (!chatSection || !chatIframe || !chatButton || !chatIcon) {
                throw new Error("Chat elements not found");
            }

            const isVisible = chatSection.style.display !== 'none';
            if (isVisible) {
                chatSection.style.display = 'none';
                chatIframe.src = ''; // Clear src to stop loading
                chatButton.innerHTML = '<i class="fas fa-comment"></i> Show Comments';
            } else {
                chatSection.style.display = 'block';
                chatIframe.src = 'https://www.example.com/chat'; // Load chat
                chatButton.innerHTML = '<i class="fas fa-comment-slash"></i> Hide Comments';
            }
        } catch (error) {
            console.error("toggleChat error:", error);
        }
    }

    function initializePlayer() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const srcParam = urlParams.get('src');
            const videoUrl = urlParams.get('hls');

            const iframe = document.getElementById('iframe');
            const jwPlayerDiv = document.getElementById('jwPlayer');

            if (!iframe || !jwPlayerDiv) throw new Error("Player elements not found");

            if (srcParam) {
                iframe.src = srcParam;
                iframe.style.display = 'block';
                jwPlayerDiv.style.display = 'none';
            } else if (videoUrl && typeof jwplayer === 'function') {
                jwplayer("jwPlayer").setup({
                    file: videoUrl,
                    width: "100%",
                    aspectratio: "16:9"
                });
                iframe.style.display = 'none';
                jwPlayerDiv.style.display = 'block';
            }
        } catch (error) {
            console.error("initializePlayer error:", error);
        }
    }

    // Initialize the app
    startAdCountdown();
    loadShareLink();

    // Expose functions globally for inline event handlers
    window.rdmode = rdmode;
    window.toggleFullscreen = toggleFullscreen;
    window.toggleChat = toggleChat;
    window.copyToClipboard = copyToClipboard;
    window.shareTo = shareTo;
    window.skipAd = skipAd;
});
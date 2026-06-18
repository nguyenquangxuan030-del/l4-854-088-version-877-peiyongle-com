(function () {
    function initializePlayer(source) {
        var video = document.querySelector("[data-player-video]");
        var overlay = document.querySelector("[data-player-overlay]");
        var hlsInstance = null;
        var ready = false;

        if (!video || !source) {
            return;
        }

        function prepare() {
            if (ready) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
            ready = true;
        }

        function start() {
            prepare();
            if (overlay) {
                overlay.classList.add("hidden");
            }
            video.controls = true;
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        }

        function toggle() {
            if (!ready || video.paused) {
                start();
            } else {
                video.pause();
            }
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }

        video.addEventListener("click", toggle);
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("hidden");
            }
        });
        video.addEventListener("error", function () {
            if (hlsInstance && typeof hlsInstance.recoverMediaError === "function") {
                hlsInstance.recoverMediaError();
            }
        });
    }

    window.initializePlayer = initializePlayer;
})();

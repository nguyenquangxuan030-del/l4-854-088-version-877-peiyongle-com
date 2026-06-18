(function () {
    window.initPlayback = function (streamUrl) {
        function setup() {
            var shell = document.querySelector(".player-shell");
            var video = document.querySelector(".movie-player");
            var overlay = document.querySelector(".play-overlay");
            var attached = false;
            var hlsInstance = null;

            if (!shell || !video || !overlay || !streamUrl) {
                return;
            }

            function attach() {
                if (attached) {
                    return;
                }
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                    return;
                }
                video.src = streamUrl;
            }

            function play() {
                attach();
                video.controls = true;
                shell.classList.add("is-playing");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        shell.classList.remove("is-playing");
                    });
                }
            }

            overlay.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", setup);
        } else {
            setup();
        }
    };
}());

(function () {
    function initPlayer(box) {
        var video = box.querySelector('video');
        var cover = box.querySelector('.player-cover');
        var playButton = box.querySelector('[data-play]');
        var streamUrl = box.getAttribute('data-stream');
        var hlsInstance = null;

        if (!video || !streamUrl) {
            return;
        }

        function attach() {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (video.getAttribute('src') !== streamUrl) {
                    video.setAttribute('src', streamUrl);
                }
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                if (!hlsInstance) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                }
            }
        }

        function play() {
            attach();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            video.setAttribute('controls', 'controls');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (playButton) {
            playButton.addEventListener('click', play);
        }
        if (cover) {
            cover.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });
    }

    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        Array.prototype.forEach.call(document.querySelectorAll('[data-player]'), initPlayer);
    });
}());

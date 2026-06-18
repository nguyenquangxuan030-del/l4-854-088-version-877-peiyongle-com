(function () {
    var roots = Array.prototype.slice.call(document.querySelectorAll('[data-media-url]'));

    roots.forEach(function (root) {
        var video = root.querySelector('video');
        var overlay = root.querySelector('.player-overlay');
        var mediaUrl = root.getAttribute('data-media-url');
        var ready = false;
        var hls = null;

        var prepare = function () {
            if (ready || !video || !mediaUrl) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
                video.src = mediaUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(mediaUrl);
                hls.attachMedia(video);
            } else {
                video.src = mediaUrl;
            }
        };

        var start = function () {
            prepare();
            root.classList.add('is-playing');
            var action = video.play();
            if (action && action.catch) {
                action.catch(function () {
                    root.classList.remove('is-playing');
                });
            }
        };

        if (overlay) {
            overlay.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener('play', function () {
                root.classList.add('is-playing');
            });
            video.addEventListener('ended', function () {
                root.classList.remove('is-playing');
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();

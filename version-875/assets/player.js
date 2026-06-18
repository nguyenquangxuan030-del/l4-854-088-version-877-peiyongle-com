import { H as Hls } from './hls-vendor-dru42stk.js';

function setupPlayer(panel) {
  const video = panel.querySelector('video[data-src]');
  const button = panel.querySelector('.play-overlay');
  const source = video ? video.dataset.src : '';
  let hlsInstance = null;

  if (!video || !source) {
    return;
  }

  function attachSource() {
    if (video.dataset.loaded === 'true') {
      return Promise.resolve();
    }

    video.dataset.loaded = 'true';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 60
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return new Promise(function (resolve) {
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
      });
    }

    video.src = source;
    return Promise.resolve();
  }

  function playVideo() {
    attachSource().then(function () {
      panel.classList.add('is-playing');
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          panel.classList.remove('is-playing');
        });
      }
    });
  }

  button?.addEventListener('click', playVideo);

  video.addEventListener('play', function () {
    panel.classList.add('is-playing');
  });

  video.addEventListener('pause', function () {
    if (!video.ended) {
      panel.classList.remove('is-playing');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

document.querySelectorAll('.js-player').forEach(setupPlayer);

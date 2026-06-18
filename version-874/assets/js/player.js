
(function () {
  var video = document.querySelector("[data-player-video]");
  var overlay = document.querySelector("[data-player-overlay]");
  var button = document.querySelector("[data-player-button]");
  var attached = false;

  function getSource() {
    try {
      return moviePlayerSource;
    } catch (error) {
      return "";
    }
  }

  function attachSource() {
    var source = getSource();
    if (!video || !source || attached) {
      return;
    }
    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function startPlayback() {
    if (!video) {
      return;
    }
    attachSource();
    video.controls = true;
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener("click", startPlayback);
  }
  if (button) {
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      startPlayback();
    });
  }
  if (video) {
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
  }
})();


(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var root = document.querySelector(".hero-carousel");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var prev = root.querySelector(".hero-arrow.prev");
    var next = root.querySelector(".hero-arrow.next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });
    show(0);
    restart();
  }

  function initSearchForms() {
    Array.prototype.slice.call(document.querySelectorAll(".js-search-form")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          input && input.focus();
        }
      });
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (query) {
      Array.prototype.slice.call(document.querySelectorAll("input[name='q'], .movie-filter")).forEach(function (input) {
        input.value = query;
      });
    }
  }

  function initFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".movie-filter"));
    if (!inputs.length) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card-item, .ranking-row"));

    function apply(value) {
      var needle = normalize(value);
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search") || card.textContent);
        card.classList.toggle("hidden", Boolean(needle) && haystack.indexOf(needle) === -1);
      });
    }

    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        apply(input.value);
      });
      if (input.value) {
        apply(input.value);
      }
    });
  }

  function initPlayers() {
    Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(function (root) {
      var video = root.querySelector("video");
      var overlay = root.querySelector(".player-overlay");
      var stream = root.getAttribute("data-stream");
      var hls = null;
      var attached = false;

      function attach() {
        if (!video || !stream || attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function start() {
        attach();
        root.classList.add("is-playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            root.classList.remove("is-playing");
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (!attached) {
          start();
        }
      });
      video.addEventListener("play", function () {
        root.classList.add("is-playing");
      });
      video.addEventListener("ended", function () {
        if (hls && typeof hls.stopLoad === "function") {
          hls.stopLoad();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearchForms();
    initFilters();
    initPlayers();
  });
})();

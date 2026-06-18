(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function text(value) {
    return String(value || "").toLowerCase();
  }

  function setupNav() {
    var toggle = qs("[data-nav-toggle]");
    var nav = qs("[data-main-nav]");
    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupFilters() {
    var search = qs("#siteSearch");
    var cards = qsa(".js-card");
    if (!search || cards.length === 0) {
      return;
    }

    var yearSelect = qs("#yearFilter");
    var typeSelect = qs("#typeFilter");
    var empty = qs("#emptyState");
    var years = [];
    var types = [];

    cards.forEach(function (card) {
      var year = card.getAttribute("data-year") || "";
      var type = card.getAttribute("data-type") || "";
      if (year && years.indexOf(year) === -1) {
        years.push(year);
      }
      if (type && types.indexOf(type) === -1) {
        types.push(type);
      }
    });

    years.sort().reverse();
    types.sort();

    if (yearSelect) {
      years.forEach(function (year) {
        var option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
      });
    }

    if (typeSelect) {
      types.forEach(function (type) {
        var option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
      });
    }

    function applyFilter() {
      var keyword = text(search.value);
      var yearValue = yearSelect ? yearSelect.value : "";
      var typeValue = typeSelect ? typeSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = text([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !yearValue || card.getAttribute("data-year") === yearValue;
        var matchType = !typeValue || card.getAttribute("data-type") === typeValue;
        var matched = matchKeyword && matchYear && matchType;

        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    search.addEventListener("input", applyFilter);
    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilter);
    }
    if (typeSelect) {
      typeSelect.addEventListener("change", applyFilter);
    }
  }

  function setupHeroSlider() {
    var slider = qs("[data-slider]");
    if (!slider) {
      return;
    }

    var slides = qsa(".hero-slide", slider);
    var next = qs("[data-slide-next]");
    var prev = qs("[data-slide-prev]");
    var index = 0;

    function show(nextIndex) {
      if (slides.length === 0) {
        return;
      }

      slides[index].classList.remove("is-active");
      index = (nextIndex + slides.length) % slides.length;
      slides[index].classList.add("is-active");
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }
  }

  function setupPlayers() {
    qsa(".js-player").forEach(function (player) {
      var video = qs("video", player);
      var overlay = qs(".play-overlay", player);
      var src = player.getAttribute("data-src");

      if (!video || !src) {
        return;
      }

      var hlsInstance = null;
      var started = false;

      function loadAndPlay() {
        if (started) {
          video.play();
          return;
        }

        started = true;
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        video.setAttribute("controls", "controls");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          video.play();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play();
          });
          return;
        }

        video.src = src;
        video.play();
      }

      if (overlay) {
        overlay.addEventListener("click", loadAndPlay);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          loadAndPlay();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupNav();
    setupFilters();
    setupHeroSlider();
    setupPlayers();
  });
})();

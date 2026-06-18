
(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      if (slides.length > 1) {
        timer = setInterval(function () {
          showSlide(current + 1);
        }, 5600);
      }
    }

    if (slides.length) {
      showSlide(0);
      restart();
      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(current - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          showSlide(current + 1);
          restart();
        });
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
          restart();
        });
      });
    }

    var search = document.querySelector("[data-card-search]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-empty-result]");

    function applyFilters() {
      var query = search ? search.value.trim().toLowerCase() : "";
      var typeValue = typeFilter ? typeFilter.value : "";
      var yearValue = yearFilter ? yearFilter.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var title = (card.getAttribute("data-title") || "").toLowerCase();
        var type = card.getAttribute("data-type") || "";
        var year = card.getAttribute("data-year") || "";
        var match = true;

        if (query && title.indexOf(query) === -1) {
          match = false;
        }
        if (typeValue && type !== typeValue) {
          match = false;
        }
        if (yearValue && year !== yearValue) {
          match = false;
        }

        card.style.display = match ? "" : "none";
        if (match) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    if (search || typeFilter || yearFilter) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && search) {
        search.value = q;
      }
      [search, typeFilter, yearFilter].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });
      applyFilters();
    }
  });
})();

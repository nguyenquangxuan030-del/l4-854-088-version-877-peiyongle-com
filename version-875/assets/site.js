(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.closest('.poster-frame, .hero-poster, .detail-poster')?.classList.add('image-missing');
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.from(hero.querySelectorAll('.hero-slide'));
    var dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;
    var timer = null;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === active);
      });
    }

    function startAutoPlay() {
      stopAutoPlay();
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5600);
    }

    function stopAutoPlay() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.heroDot || 0));
        startAutoPlay();
      });
    });

    hero.addEventListener('mouseenter', stopAutoPlay);
    hero.addEventListener('mouseleave', startAutoPlay);
    startAutoPlay();
  }

  document.querySelectorAll('[data-filter-root]').forEach(function (root) {
    var section = root.closest('.content-section') || document;
    var cards = Array.from(section.querySelectorAll('[data-filter-list] .movie-card'));
    var searchInput = root.querySelector('[data-filter-search]');
    var typeSelect = root.querySelector('[data-filter-type]');
    var regionSelect = root.querySelector('[data-filter-region]');
    var yearSelect = root.querySelector('[data-filter-year]');
    var countTarget = root.querySelector('[data-filter-count]');
    var emptyState = null;

    function ensureEmptyState() {
      if (!emptyState) {
        emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.textContent = '没有找到符合条件的影片，请调整筛选条件。';
        var list = section.querySelector('[data-filter-list]');
        if (list) {
          list.appendChild(emptyState);
        }
      }
      return emptyState;
    }

    function applyFilter() {
      var query = (searchInput?.value || '').trim().toLowerCase();
      var type = typeSelect?.value || '';
      var region = regionSelect?.value || '';
      var year = yearSelect?.value || '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (card.dataset.search || '').toLowerCase();
        var matched = true;
        if (query && !haystack.includes(query)) {
          matched = false;
        }
        if (type && card.dataset.type !== type) {
          matched = false;
        }
        if (region && card.dataset.region !== region) {
          matched = false;
        }
        if (year && card.dataset.year !== year) {
          matched = false;
        }
        card.classList.toggle('hidden-by-filter', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (countTarget) {
        countTarget.textContent = String(visible);
      }
      ensureEmptyState().style.display = visible ? 'none' : 'block';
    }

    [searchInput, typeSelect, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  });
})();

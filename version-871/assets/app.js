(function () {
    var toggle = document.querySelector('.nav-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            var open = panel.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        var showSlide = function (index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide((current + 1) % slides.length);
            }, 5200);
        }
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var globalSearch = document.querySelector('[data-global-search]');
    var filterInput = document.querySelector('[data-filter-input]');
    var sortSelect = document.querySelector('[data-sort-select]');
    var cardList = document.querySelector('[data-card-list]');

    if (globalSearch && query) {
        globalSearch.value = query;
    }

    if (filterInput && query) {
        filterInput.value = query;
    }

    var normalize = function (value) {
        return (value || '').toString().toLowerCase().trim();
    };

    var filterCards = function () {
        if (!cardList || !filterInput) {
            return;
        }
        var value = normalize(filterInput.value);
        var cards = Array.prototype.slice.call(cardList.querySelectorAll('.movie-card'));
        cards.forEach(function (card) {
            var haystack = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.year,
                card.dataset.type,
                card.dataset.genre,
                card.dataset.tags
            ].join(' '));
            card.classList.toggle('is-hidden', value && haystack.indexOf(value) === -1);
        });
    };

    var sortCards = function () {
        if (!cardList || !sortSelect) {
            return;
        }
        var cards = Array.prototype.slice.call(cardList.querySelectorAll('.movie-card'));
        var mode = sortSelect.value;
        if (mode === 'year-desc') {
            cards.sort(function (a, b) {
                return parseInt(b.dataset.year, 10) - parseInt(a.dataset.year, 10);
            });
        }
        if (mode === 'title-asc') {
            cards.sort(function (a, b) {
                return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
            });
        }
        cards.forEach(function (card) {
            cardList.appendChild(card);
        });
        filterCards();
    };

    if (filterInput) {
        filterInput.addEventListener('input', filterCards);
        filterCards();
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', sortCards);
    }
})();

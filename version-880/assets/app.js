(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function setupNav() {
        var button = document.querySelector('[data-nav-toggle]');
        var menu = document.querySelector('[data-nav-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var slider = document.querySelector('[data-hero]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function activate(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                activate(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                activate(index);
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        activate(0);
        start();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var rootSelector = panel.getAttribute('data-filter-panel');
            var root = document.querySelector(rootSelector);
            if (!root) {
                return;
            }
            var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
            var empty = document.querySelector('[data-no-results]');
            var searchInput = panel.querySelector('[data-filter-search]');
            var regionSelect = panel.querySelector('[data-filter-region]');
            var typeSelect = panel.querySelector('[data-filter-type]');
            var yearSelect = panel.querySelector('[data-filter-year]');

            function normalize(value) {
                return String(value || '').toLowerCase().trim();
            }

            function matches(card) {
                var keyword = normalize(searchInput ? searchInput.value : '');
                var region = regionSelect ? regionSelect.value : '';
                var type = typeSelect ? typeSelect.value : '';
                var year = yearSelect ? yearSelect.value : '';
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre')
                ].join(' '));
                var regionText = card.getAttribute('data-region') || '';
                var typeText = card.getAttribute('data-type') || '';
                var yearText = card.getAttribute('data-year') || '';
                return (!keyword || haystack.indexOf(keyword) !== -1) &&
                    (!region || regionText.indexOf(region) !== -1) &&
                    (!type || typeText.indexOf(type) !== -1) &&
                    (!year || yearText === year);
            }

            function apply() {
                var shown = 0;
                cards.forEach(function (card) {
                    var visible = matches(card);
                    card.style.display = visible ? '' : 'none';
                    if (visible) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.style.display = shown ? 'none' : 'block';
                }
            }

            [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    ready(function () {
        setupNav();
        setupHero();
        setupFilters();
    });
}());

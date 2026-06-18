(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobilePanel = document.querySelector("[data-mobile-panel]");

        if (menuButton && mobilePanel) {
            menuButton.addEventListener("click", function () {
                mobilePanel.classList.toggle("open");
            });
        }

        document.querySelectorAll(".site-search").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    return;
                }
                event.preventDefault();
                window.location.href = form.getAttribute("action") + "?q=" + encodeURIComponent(input.value.trim());
            });
        });

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var current = 0;

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

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        var listing = document.querySelector("[data-listing]");
        var panel = document.querySelector("[data-filter-panel]");
        if (listing && panel) {
            var cards = Array.prototype.slice.call(listing.querySelectorAll(".movie-card"));
            var keywordInput = panel.querySelector("[data-filter-input]");
            var regionSelect = panel.querySelector("[data-region-filter]");
            var yearSelect = panel.querySelector("[data-year-filter]");
            var sortSelect = panel.querySelector("[data-sort-select]");
            var empty = document.querySelector("[data-empty-state]");

            function normalize(value) {
                return String(value || "").toLowerCase();
            }

            function applyFilters() {
                var keyword = normalize(keywordInput && keywordInput.value);
                var region = regionSelect ? regionSelect.value : "";
                var year = yearSelect ? yearSelect.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre")
                    ].join(" "));
                    var ok = true;
                    if (keyword && haystack.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (region && card.getAttribute("data-region") !== region) {
                        ok = false;
                    }
                    if (year && card.getAttribute("data-year") !== year) {
                        ok = false;
                    }
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            function sortCards() {
                var mode = sortSelect ? sortSelect.value : "default";
                var sorted = cards.slice();
                if (mode === "rating") {
                    sorted.sort(function (a, b) {
                        return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
                    });
                } else if (mode === "views") {
                    sorted.sort(function (a, b) {
                        return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
                    });
                } else if (mode === "year") {
                    sorted.sort(function (a, b) {
                        return String(b.getAttribute("data-year")).localeCompare(String(a.getAttribute("data-year")), "zh-CN", { numeric: true });
                    });
                } else if (mode === "title") {
                    sorted.sort(function (a, b) {
                        return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-CN");
                    });
                } else {
                    sorted = cards.slice();
                }
                sorted.forEach(function (card) {
                    listing.appendChild(card);
                });
                applyFilters();
            }

            [keywordInput, regionSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilters);
                    control.addEventListener("change", applyFilters);
                }
            });
            if (sortSelect) {
                sortSelect.addEventListener("change", sortCards);
            }
            applyFilters();
        }
    });
})();

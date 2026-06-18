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

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                var open = mobileNav.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-slide")) || 0);
                    start();
                });
            });
            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    start();
                });
            }
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        var urlParams = new URLSearchParams(window.location.search);
        var urlQuery = urlParams.get("q") || "";
        var urlYear = urlParams.get("year") || "";
        var lists = Array.prototype.slice.call(document.querySelectorAll("[data-searchable-list]"));
        var form = document.querySelector("[data-filter-form]");
        if (lists.length && form) {
            var cards = [];
            lists.forEach(function (list) {
                cards = cards.concat(Array.prototype.slice.call(list.querySelectorAll("[data-card]")));
            });
            var search = form.querySelector("[data-search-input]");
            var yearSelect = form.querySelector("[data-filter='year']");
            var regionSelect = form.querySelector("[data-filter='region']");
            var sortSelect = form.querySelector("[data-sort]");
            var reset = form.querySelector("[data-reset]");

            function fillSelect(select, values) {
                if (!select) {
                    return;
                }
                var first = select.querySelector("option");
                select.innerHTML = "";
                if (first) {
                    select.appendChild(first);
                }
                values.forEach(function (value) {
                    if (!value) {
                        return;
                    }
                    var option = document.createElement("option");
                    option.value = value;
                    option.textContent = value;
                    select.appendChild(option);
                });
            }

            function unique(name) {
                var seen = new Set();
                cards.forEach(function (card) {
                    String(card.dataset[name] || "").split(/[、,，/]/).forEach(function (part) {
                        var value = part.trim();
                        if (value) {
                            seen.add(value);
                        }
                    });
                });
                return Array.from(seen).sort(function (a, b) {
                    return b.localeCompare(a, "zh-Hans-CN", { numeric: true });
                });
            }

            fillSelect(yearSelect, unique("year"));
            fillSelect(regionSelect, unique("region"));
            if (search && urlQuery) {
                search.value = urlQuery;
            }
            if (yearSelect && urlYear) {
                yearSelect.value = urlYear;
            }

            function applyFilters() {
                var query = normalize(search ? search.value : "");
                var year = normalize(yearSelect ? yearSelect.value : "");
                var region = normalize(regionSelect ? regionSelect.value : "");
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.category,
                        card.textContent
                    ].join(" "));
                    var matchQuery = !query || haystack.indexOf(query) !== -1;
                    var matchYear = !year || normalize(card.dataset.year) === year;
                    var matchRegion = !region || normalize(card.dataset.region).indexOf(region) !== -1;
                    card.classList.toggle("is-hidden", !(matchQuery && matchYear && matchRegion));
                });
            }

            function applySort() {
                if (!sortSelect) {
                    return;
                }
                var mode = sortSelect.value;
                lists.forEach(function (list) {
                    var localCards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
                    if (mode === "default") {
                        localCards.sort(function (a, b) {
                            return Number(a.dataset.views || 0) - Number(b.dataset.views || 0);
                        });
                    }
                    if (mode === "rating") {
                        localCards.sort(function (a, b) {
                            return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
                        });
                    }
                    if (mode === "views") {
                        localCards.sort(function (a, b) {
                            return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
                        });
                    }
                    if (mode === "year") {
                        localCards.sort(function (a, b) {
                            return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                        });
                    }
                    localCards.forEach(function (card) {
                        list.appendChild(card);
                    });
                });
            }

            [search, yearSelect, regionSelect].forEach(function (el) {
                if (el) {
                    el.addEventListener("input", applyFilters);
                    el.addEventListener("change", applyFilters);
                }
            });
            if (sortSelect) {
                sortSelect.addEventListener("change", function () {
                    applySort();
                    applyFilters();
                });
            }
            if (reset) {
                reset.addEventListener("click", function () {
                    if (search) {
                        search.value = "";
                    }
                    if (yearSelect) {
                        yearSelect.value = "";
                    }
                    if (regionSelect) {
                        regionSelect.value = "";
                    }
                    if (sortSelect) {
                        sortSelect.value = "default";
                    }
                    applySort();
                    applyFilters();
                });
            }
            applyFilters();
        }
    });
}());

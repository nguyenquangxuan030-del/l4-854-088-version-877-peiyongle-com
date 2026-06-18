(function () {
    function getQuery() {
        var params = new URLSearchParams(window.location.search);
        return (params.get("q") || "").trim();
    }

    function card(movie) {
        return [
            '<article class="movie-card">',
            '<a href="' + movie.href + '" class="movie-link" aria-label="观看 ' + escapeHtml(movie.title) + '">',
            '<div class="poster-wrap">',
            '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="poster-badge">' + escapeHtml(movie.region) + '</span>',
            '<span class="rating-badge">★ ' + escapeHtml(movie.rating) + '</span>',
            '</div>',
            '<div class="card-body">',
            '<h3>' + escapeHtml(movie.title) + '</h3>',
            '<p>' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="meta-row"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
            '<div class="card-tags"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.tags) + '</span></div>',
            '</div>',
            '</a>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function normalize(value) {
        return String(value || '').toLowerCase();
    }

    document.addEventListener('DOMContentLoaded', function () {
        var input = document.querySelector('[data-search-page-input]');
        var title = document.querySelector('[data-search-title]');
        var desc = document.querySelector('[data-search-desc]');
        var results = document.getElementById('searchResults');
        var empty = document.getElementById('searchEmpty');
        var form = document.querySelector('[data-search-page-form]');
        var query = getQuery();

        if (input) {
            input.value = query;
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var value = input ? input.value.trim() : '';
                if (value) {
                    window.location.href = './search.html?q=' + encodeURIComponent(value);
                }
            });
        }

        var data = Array.isArray(window.MOVIE_SEARCH_DATA) ? window.MOVIE_SEARCH_DATA : [];
        var list;
        if (query) {
            var q = normalize(query);
            list = data.filter(function (movie) {
                return normalize([movie.title, movie.region, movie.year, movie.genre, movie.type, movie.tags, movie.oneLine].join(' ')).indexOf(q) !== -1;
            });
            if (title) {
                title.textContent = '搜索结果';
            }
            if (desc) {
                desc.textContent = '关键词：' + query;
            }
        } else {
            list = data.slice().sort(function (a, b) {
                return Number(b.views) - Number(a.views);
            }).slice(0, 48);
        }

        if (results) {
            results.innerHTML = list.map(card).join('');
        }
        if (empty) {
            empty.hidden = list.length !== 0;
        }
    });
})();

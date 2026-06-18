(function () {
  var index = window.MOVIE_SEARCH_INDEX || [];
  var input = document.querySelector('[data-search-input]');
  var typeSelect = document.querySelector('[data-search-type]');
  var regionSelect = document.querySelector('[data-search-region]');
  var yearSelect = document.querySelector('[data-search-year]');
  var results = document.querySelector('[data-search-results]');
  var count = document.querySelector('[data-search-count]');

  if (!input || !results) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  input.value = params.get('q') || '';

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card">'
      + '<a class="poster-frame" href="movies/' + escapeHtml(item.id4) + '.html" aria-label="观看 ' + escapeHtml(item.title) + '">'
      + '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">'
      + '<span class="score-badge">' + escapeHtml(item.rating) + '</span>'
      + '<span class="type-badge">' + escapeHtml(item.type) + '</span>'
      + '</a>'
      + '<div class="movie-card-body">'
      + '<div class="movie-meta-line"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span></div>'
      + '<h3><a href="movies/' + escapeHtml(item.id4) + '.html">' + escapeHtml(item.title) + '</a></h3>'
      + '<p>' + escapeHtml(item.oneLine) + '</p>'
      + '<div class="chip-row">' + tags + '</div>'
      + '<div class="card-foot"><span>' + escapeHtml(item.views) + ' 热度</span><a href="category/' + escapeHtml(item.categorySlug) + '.html">' + escapeHtml(item.categoryName) + '</a></div>'
      + '</div>'
      + '</article>';
  }

  function applySearch() {
    var query = input.value.trim().toLowerCase();
    var type = typeSelect.value;
    var region = regionSelect.value;
    var year = yearSelect.value;

    var matched = index.filter(function (item) {
      var haystack = item.search.toLowerCase();
      if (query && !haystack.includes(query)) {
        return false;
      }
      if (type && item.type !== type) {
        return false;
      }
      if (region && item.region !== region) {
        return false;
      }
      if (year && item.year !== year) {
        return false;
      }
      return true;
    }).slice(0, 300);

    count.textContent = String(matched.length);
    if (!matched.length) {
      results.innerHTML = '<div class="empty-state">没有找到匹配影片，请尝试其他关键词。</div>';
      return;
    }
    results.innerHTML = matched.map(cardTemplate).join('');
  }

  [input, typeSelect, regionSelect, yearSelect].forEach(function (control) {
    control.addEventListener('input', applySearch);
    control.addEventListener('change', applySearch);
  });

  applySearch();
})();

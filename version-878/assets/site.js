(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navMenu = document.querySelector('[data-nav-menu]');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('is-open');
    });
  }

  function setupHeroSlider() {
    const slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }

    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    let current = 0;
    let timer = null;

    function show(index) {
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
        show(current + 1);
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
        show(index);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function setupInlineFilters() {
    const inputs = Array.from(document.querySelectorAll('.filter-input'));
    inputs.forEach(function (input) {
      const targetId = input.getAttribute('data-filter-target');
      const target = targetId ? document.getElementById(targetId) : null;
      if (!target) {
        return;
      }

      const items = Array.from(target.querySelectorAll('[data-title]'));
      input.addEventListener('input', function () {
        const query = normalize(input.value);
        items.forEach(function (item) {
          const haystack = normalize([
            item.dataset.title,
            item.dataset.tags,
            item.dataset.region,
            item.dataset.year,
            item.textContent
          ].join(' '));
          item.hidden = query !== '' && !haystack.includes(query);
        });
      });
    });
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }

      const existing = document.querySelector('script[data-hls-loader]');
      if (existing) {
        existing.addEventListener('load', function () {
          resolve(window.Hls);
        });
        existing.addEventListener('error', reject);
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.dataset.hlsLoader = 'true';
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function setupPlayers() {
    const players = Array.from(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      const video = player.querySelector('video');
      const button = player.querySelector('[data-play-button]');
      const status = player.querySelector('[data-player-status]');
      const source = (button && button.dataset.src) || player.dataset.src;

      if (!video || !button || !source) {
        return;
      }

      async function play() {
        player.classList.add('is-loading');
        if (status) {
          status.textContent = '正在加载播放源…';
        }

        try {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
          } else {
            const Hls = await loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js');
            if (Hls && Hls.isSupported()) {
              if (video._hlsInstance) {
                video._hlsInstance.destroy();
              }
              const hls = new Hls({ enableWorker: true });
              video._hlsInstance = hls;
              hls.loadSource(source);
              hls.attachMedia(video);
            } else {
              video.src = source;
            }
          }

          player.classList.remove('is-loading');
          player.classList.add('is-playing');
          if (status) {
            status.textContent = '播放源已绑定，可使用播放器控制栏调整播放。';
          }
          const result = video.play();
          if (result && typeof result.catch === 'function') {
            result.catch(function () {
              if (status) {
                status.textContent = '播放源已加载，请再次点击视频播放。';
              }
            });
          }
        } catch (error) {
          player.classList.remove('is-loading');
          if (status) {
            status.textContent = '播放源加载失败，请刷新页面后重试。';
          }
        }
      }

      button.addEventListener('click', play);
    });
  }

  function movieCardTemplate(movie) {
    const tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 3) : [];
    const tagMarkup = tags.map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card compact" data-title="' + escapeHtml(movie.title) + '" data-tags="' + escapeHtml(tags.join(',')) + '">',
      '  <a href="video/' + movie.id + '.html" class="poster-link" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <span class="poster-frame">',
      '      <img src="./' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <span class="poster-shade"></span>',
      '      <span class="play-mark">▶</span>',
      '      <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
      '      <span class="score-badge">' + escapeHtml(movie.rating) + '</span>',
      '    </span>',
      '  </a>',
      '  <div class="movie-info">',
      '    <h3><a href="video/' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine || '') + '</p>',
      '    <div class="meta-row"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '    <div class="tag-row">' + tagMarkup + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupSearchPage() {
    const main = document.querySelector('main[data-page="search"]');
    if (!main || !window.MOVIE_DATA) {
      return;
    }

    const form = main.querySelector('[data-search-form]');
    const input = main.querySelector('[data-search-input]');
    const results = main.querySelector('[data-search-results]');
    const title = main.querySelector('[data-search-title]');
    const summary = main.querySelector('[data-search-summary]');
    const params = new URLSearchParams(window.location.search);

    function render(query) {
      const keyword = normalize(query);
      if (!keyword) {
        return;
      }

      const matched = window.MOVIE_DATA.filter(function (movie) {
        const haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genreRaw,
          (movie.tags || []).join(' '),
          movie.oneLine,
          movie.summary
        ].join(' '));
        return haystack.includes(keyword);
      }).slice(0, 120);

      if (title) {
        title.textContent = '“' + query + '”的搜索结果';
      }
      if (summary) {
        summary.textContent = matched.length ? '已显示匹配影片，可点击卡片进入详情页。' : '没有找到匹配内容，可尝试更换关键词。';
      }
      if (results) {
        results.innerHTML = matched.map(movieCardTemplate).join('\n');
      }
    }

    const initial = params.get('q') || '';
    if (input && initial) {
      input.value = initial;
      render(initial);
    }

    if (form && input) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        render(input.value);
        const url = new URL(window.location.href);
        url.searchParams.set('q', input.value);
        window.history.replaceState({}, '', url.toString());
      });
    }
  }

  setupHeroSlider();
  setupInlineFilters();
  setupPlayers();
  setupSearchPage();
})();
